import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, useColorScheme, SafeAreaView, KeyboardAvoidingView, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { findBlockedWord } from '../../lib/moderation';

const BACKGROUND_COLORS = ['#FFFFFF', '#FEE2E2', '#FEF3C7', '#D1FAE5', '#DBEAFE', '#E0E7FF', '#F3E8FF'];

export default function PostarFrase() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [bgColor, setBgColor] = useState(BACKGROUND_COLORS[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Erro', 'Preencha a frase.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Acesso negado', 'Você precisa estar logado para publicar.');
      router.push('/login');
      return;
    }

    const blockedWord = findBlockedWord(content);

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

    savePost('aprovado');
  };

  const savePost = async (status: string) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('posts').insert({
      autor_id: user?.id,
      titulo: 'Frase',
      conteudo: content,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean).join(','),
      tipo: 'texto',
      categoria: 'Frases',
      status_aprovacao: status,
      cor_fundo: bgColor,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao publicar.');
      console.error(error);
    } else {
      Alert.alert('Sucesso', status === 'aprovado' ? 'Sua frase foi publicada!' : 'Sua frase foi enviada para análise.');
      router.replace('/');
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
          <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>Nova Frase</Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark ? styles.textDark : styles.textLight]}>Conteúdo</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                isDark ? styles.inputDark : styles.inputLight,
                { backgroundColor: bgColor }
              ]}
              placeholder="Escreva algo interessante..."
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={content}
              onChangeText={setContent}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark ? styles.textDark : styles.textLight]}>Cor de Fundo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorPicker}>
              {BACKGROUND_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorOption, { backgroundColor: color }, bgColor === color && styles.colorOptionSelected]}
                  onPress={() => setBgColor(color)}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark ? styles.textDark : styles.textLight]}>Tags (separadas por vírgula)</Text>
            <TextInput
              style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
              placeholder="ex: sabedoria, motivação"
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
              <Text style={styles.submitButtonText}>Publicar</Text>
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
    fontSize: 18,
    color: '#111827',
  },
  inputLight: {
    borderColor: '#E5E7EB',
  },
  inputDark: {
    borderColor: '#374151',
  },
  textArea: { minHeight: 150 },
  colorPicker: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  textLight: { color: '#111827' },
  textDark: { color: '#F9FAFB' },
});
