import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, useColorScheme, SafeAreaView, KeyboardAvoidingView, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { i18n } from '../../lib/i18n';
import { findBlockedWord } from '../../lib/moderation';

export default function PostarPiada() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Erro', 'Preencha o título e o conteúdo da piada.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Acesso negado', 'Você precisa estar logado para publicar.');
      router.push('/login');
      return;
    }

    const blockedWord = findBlockedWord(content) || findBlockedWord(title);

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
      titulo: title,
      conteudo: content,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean).join(','),
      tipo: 'texto',
      categoria: 'Piadas',
      status_aprovacao: status,
      cor_fundo: '#FFFFFF', // Default background
    });

    setLoading(false);

    if (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao publicar.');
      console.error(error);
    } else {
      Alert.alert('Sucesso', status === 'aprovado' ? 'Sua piada foi publicada!' : 'Sua piada foi enviada para análise.');
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
          <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>Nova Piada</Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark ? styles.textDark : styles.textLight]}>Título</Text>
            <TextInput
              style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
              placeholder="Dê um título para sua piada"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark ? styles.textDark : styles.textLight]}>Conteúdo</Text>
            <TextInput
              style={[styles.input, styles.textArea, isDark ? styles.inputDark : styles.inputLight]}
              placeholder="Digite sua piada aqui..."
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={content}
              onChangeText={setContent}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark ? styles.textDark : styles.textLight]}>Tags (separadas por vírgula)</Text>
            <TextInput
              style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
              placeholder="ex: engraçado, curto, humor"
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
  textArea: { minHeight: 120 },
  submitButton: {
    backgroundColor: '#3B82F6',
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
