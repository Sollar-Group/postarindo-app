import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, useColorScheme, SafeAreaView, KeyboardAvoidingView, ScrollView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { findBlockedWord } from '../../lib/moderation';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { ImageIcon } from 'lucide-react-native';

export default function PostarImagem() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !imageUri) {
      Alert.alert('Erro', 'Preencha o título e selecione uma imagem.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Acesso negado', 'Você precisa estar logado para publicar.');
      router.push('/login');
      return;
    }

    const blockedWord = findBlockedWord(title);

    if (blockedWord) {
      Alert.alert(
        'Conteúdo Sensível',
        `Encontramos a palavra bloqueada "${blockedWord}". Deseja corrigir ou enviar para análise?`,
        [
          { text: 'Corrigir', style: 'cancel' },
          { text: 'Solicitar Análise', onPress: () => savePost('retido') }
        ]
      );
      return;
    }

    // Default media rule: 'pendente' instead of 'aprovado'
    savePost('pendente');
  };

  const savePost = async (status: string) => {
    setLoading(true);
    try {
      const uploadedUrl = await uploadToCloudinary(imageUri!);

      if (!uploadedUrl) {
        Alert.alert('Erro', 'Falha ao fazer upload da imagem.');
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('posts').insert({
        autor_id: user?.id,
        titulo: title,
        conteudo: 'Imagem',
        tags: tags.split(',').map(t => t.trim()).filter(Boolean).join(','),
        imagem_url: uploadedUrl,
        tipo: 'imagem',
        categoria: 'Imagens',
        status_aprovacao: status,
      });

      if (error) throw error;

      Alert.alert('Sucesso', 'Sua imagem foi enviada para moderação e logo será publicada.');
      router.replace('/');
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Ocorreu um erro ao publicar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.bgDark : styles.bgLight]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>Nova Imagem</Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark ? styles.textDark : styles.textLight]}>Título</Text>
            <TextInput
              style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
              placeholder="Descreva a imagem"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark ? styles.textDark : styles.textLight]}>Imagem</Text>

            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.changeImageBtn} onPress={pickImage}>
                  <Text style={styles.changeImageText}>Trocar Imagem</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.uploadBox, isDark ? styles.uploadBoxDark : styles.uploadBoxLight]}
                onPress={pickImage}
              >
                <ImageIcon size={48} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text style={[styles.uploadText, isDark ? styles.textMutedDark : styles.textMutedLight]}>
                  Toque para selecionar
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark ? styles.textDark : styles.textLight]}>Tags (separadas por vírgula)</Text>
            <TextInput
              style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
              placeholder="ex: meme, foto"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={tags}
              onChangeText={setTags}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Enviar</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  bgLight: { backgroundColor: '#F3F4F6' },
  bgDark: { backgroundColor: '#111827' },
  container: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    color: '#111827',
  },
  inputDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
    color: '#F9FAFB',
  },
  uploadBox: {
    height: 200,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBoxLight: {
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  uploadBoxDark: {
    borderColor: '#4B5563',
    backgroundColor: '#374151',
  },
  uploadText: { marginTop: 12, fontSize: 16 },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  changeImageBtn: {
    marginTop: 12,
    padding: 8,
  },
  changeImageText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#F59E0B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  textLight: { color: '#111827' },
  textDark: { color: '#F9FAFB' },
  textMutedLight: { color: '#6B7280' },
  textMutedDark: { color: '#9CA3AF' },
});
