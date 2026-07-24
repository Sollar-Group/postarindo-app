import * as React from 'react';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Switch, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { i18n } from '../lib/i18n';
import { uploadToCloudinary } from '../lib/cloudinary';
import * as ImagePicker from 'expo-image-picker';
import { User, Shield, Camera, Trash2, LogOut } from 'lucide-react-native';
import { Image } from 'react-native';

export default function PerfilScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [activeTab, setActiveTab] = useState<'perfil' | 'seguranca'>('perfil');

  // Perfil State
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [nomeExibicao, setNomeExibicao] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [exibirInstagram, setExibirInstagram] = useState(false);

  // Seguranca State
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login');
        return;
      }

      setEmail(user.email || '');

      const { data, error } = await supabase
        .from('users')
        .select('nome_exibicao, avatar_url, instagram_handle, exibir_instagram')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setNomeExibicao(data.nome_exibicao || '');
        setAvatarUrl(data.avatar_url || '');
        setInstagramHandle(data.instagram_handle || '');
        setExibirInstagram(data.exibir_instagram || false);
      }
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar o perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setLoading(true);
      try {
        const uploadUrl = await uploadToCloudinary(result.assets[0].uri);
        if (uploadUrl) {
          setAvatarUrl(uploadUrl);
          // Optional: immediately save avatar change
          // await saveProfile(uploadUrl);
        } else {
          Alert.alert('Erro', 'Falha ao enviar imagem.');
        }
      } catch (error) {
        Alert.alert('Erro', 'Erro ao enviar imagem.');
      } finally {
        setLoading(false);
      }
    }
  }

  async function saveProfile(avatarToSave = avatarUrl) {
    setSavingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não logado');

      const { error } = await supabase
        .from('users')
        .update({
          nome_exibicao: nomeExibicao,
          avatar_url: avatarToSave,
          instagram_handle: instagramHandle,
          exibir_instagram: exibirInstagram,
        })
        .eq('id', user.id);

      if (error) throw error;
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao salvar perfil');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleUpdateEmail() {
    if (!newEmail) {
      Alert.alert('Erro', 'Digite um novo e-mail.');
      return;
    }
    setSavingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      Alert.alert('Sucesso', 'Verifique seu e-mail (novo e atual) para confirmar a alteração.');
      setNewEmail('');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao atualizar e-mail');
    } finally {
      setSavingEmail(false);
    }
  }

  async function handleUpdatePassword() {
    if (!newPassword || newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem ou estão vazias.');
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      Alert.alert('Sucesso', 'Senha atualizada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao atualizar senha');
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  async function handleDeleteAccount() {
    Alert.alert(
      'Atenção!',
      'Esta ação é irreversível. Todos os seus posts, comentários e dados serão apagados permanentemente. Deseja continuar?',
      [
        { text: i18n.t('perfil.cancelar'), style: 'cancel' },
        {
          text: 'Sim, desejo excluir',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmação Final',
              'Tem certeza absoluta de que deseja excluir sua conta?',
              [
                { text: i18n.t('perfil.cancelar'), style: 'cancel' },
                {
                  text: 'Excluir Definitivamente',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      const { error } = await supabase.rpc('delete_user');
                      if (error) throw error;
                      await supabase.auth.signOut();
                      router.replace('/');
                    } catch (error: any) {
                      Alert.alert('Erro ao excluir conta', error.message);
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  }

  const themeStyles = isDark ? darkStyles : lightStyles;
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const mutedTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const inputBg = isDark ? '#374151' : '#F3F4F6';

  if (loading && !nomeExibicao && !email) {
    return (
      <View style={[styles.container, themeStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, themeStyles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header Tabs */}
      <View style={[styles.tabContainer, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'perfil' && styles.activeTab, activeTab === 'perfil' && { borderBottomColor: '#3B82F6' }]}
          onPress={() => setActiveTab('perfil')}
        >
          <User size={20} color={activeTab === 'perfil' ? '#3B82F6' : mutedTextColor} />
          <Text style={[styles.tabText, activeTab === 'perfil' ? { color: '#3B82F6', fontWeight: 'bold' } : { color: mutedTextColor }]}>
            Meu Perfil
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'seguranca' && styles.activeTab, activeTab === 'seguranca' && { borderBottomColor: '#3B82F6' }]}
          onPress={() => setActiveTab('seguranca')}
        >
          <Shield size={20} color={activeTab === 'seguranca' ? '#3B82F6' : mutedTextColor} />
          <Text style={[styles.tabText, activeTab === 'seguranca' ? { color: '#3B82F6', fontWeight: 'bold' } : { color: mutedTextColor }]}>
            Conta & Segurança
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'perfil' ? (
          <View style={styles.section}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={handlePickImage} style={styles.avatarWrapper}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: inputBg, justifyContent: 'center', alignItems: 'center' }]}>
                    <User size={40} color={mutedTextColor} />
                  </View>
                )}
                <View style={styles.cameraIconBadge}>
                  <Camera size={16} color="#FFF" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Nome de Exibição</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                value={nomeExibicao}
                onChangeText={setNomeExibicao}
                placeholder="Seu nome"
                placeholderTextColor={mutedTextColor}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Instagram (@)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                value={instagramHandle}
                onChangeText={setInstagramHandle}
                placeholder="seuarroba"
                placeholderTextColor={mutedTextColor}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.switchGroup}>
              <Text style={[styles.label, { color: textColor, marginBottom: 0 }]}>Exibir Instagram no perfil</Text>
              <Switch
                value={exibirInstagram}
                onValueChange={setExibirInstagram}
                trackColor={{ false: '#767577', true: '#93C5FD' }}
                thumbColor={exibirInstagram ? '#3B82F6' : '#f4f3f4'}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, savingProfile && styles.disabledButton]}
              onPress={() => saveProfile()}
              disabled={savingProfile || loading}
            >
              {savingProfile ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>{i18n.t('perfil.salvar')} Alterações</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            {/* Atualizar Email */}
            <View style={[styles.card, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor }]}>
              <Text style={[styles.cardTitle, { color: textColor }]}>Atualizar E-mail</Text>
              <Text style={[styles.cardDesc, { color: mutedTextColor }]}>E-mail atual: {email}</Text>

              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="Novo e-mail"
                placeholderTextColor={mutedTextColor}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[styles.secondaryButton, savingEmail && styles.disabledButton]}
                onPress={handleUpdateEmail}
                disabled={savingEmail}
              >
                {savingEmail ? <ActivityIndicator color="#FFF" /> : <Text style={styles.secondaryButtonText}>Atualizar E-mail</Text>}
              </TouchableOpacity>
            </View>

            {/* Atualizar Senha */}
            <View style={[styles.card, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor }]}>
              <Text style={[styles.cardTitle, { color: textColor }]}>Alterar Senha</Text>

              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nova senha"
                placeholderTextColor={mutedTextColor}
                secureTextEntry
              />

              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirmar nova senha"
                placeholderTextColor={mutedTextColor}
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.secondaryButton, savingPassword && styles.disabledButton]}
                onPress={handleUpdatePassword}
                disabled={savingPassword}
              >
                {savingPassword ? <ActivityIndicator color="#FFF" /> : <Text style={styles.secondaryButtonText}>Alterar Senha</Text>}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <LogOut size={20} color="#4B5563" />
              <Text style={styles.signOutText}>{i18n.t('header.sair')} da Conta</Text>
            </TouchableOpacity>

            <View style={styles.dangerZone}>
              <Text style={styles.dangerTitle}>Zona de Perigo</Text>
              <Text style={styles.dangerDesc}>
                A exclusão da sua conta é irreversível e todos os seus dados serão perdidos.
              </Text>
              <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
                <Trash2 size={20} color="#FFF" />
                <Text style={styles.dangerButtonText}>Excluir minha conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    // border color applied inline
  },
  tabText: {
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    gap: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIconBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    marginBottom: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  signOutText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerZone: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
    gap: 12,
  },
  dangerTitle: {
    color: '#DC2626',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dangerDesc: {
    color: '#991B1B',
    fontSize: 14,
  },
  dangerButton: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  dangerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const lightStyles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: '#111827',
  },
});
