import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, useColorScheme, SafeAreaView, KeyboardAvoidingView, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { findBlockedWord } from '../../lib/moderation';

export default function PostarVideo() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !videoUrl.trim()) {
      Alert.alert('Erro', 'Preencha o título e o link do vídeo.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Acesso negado', 'Você precisa estar logado para publicar.');
      router.push('/login');
      return;
    }

    const blockedWord = findBlockedWord(title) || findBlockedWord(videoUrl);

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

    // Default media rule: 'pendente'
    savePost('pendente');
  };

  const savePost = async (status: string) => {
    setLoading(true);

    // Simplistic link fix/embed format if they passed a youtube shorts or regular link
    let finalUrl = videoUrl;
    if (videoUrl.includes('youtube.com/shorts/')) {
        const id = videoUrl.split('/shorts/')[1].split('?')[0];
        finalUrl = `https://www.youtube.com/embed/${id}`;
    } else if (videoUrl.includes('youtube.com/watch?v=')) {
        const id = videoUrl.split('v=')[1].split('&')[0];
        finalUrl = `https://www.youtube.com/embed/${id}`;
    } else if (videoUrl.includes('youtu.be/')) {
        const id = videoUrl.split('youtu.be/')[1].split('?')[0];
        finalUrl = `https://www.youtube.com/embed/${id}`;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('posts').insert({
      autor_id: user?.id,
      titulo: title,
      conteudo: 'Video',
      video_url: finalUrl,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean).join(','),
      tipo: 'video',
      categoria: 'Vídeos',
      status_aprovacao: status,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao publicar.');
      console.error(error);
    } else {
      Alert.alert('Sucesso', 'Seu vídeo foi enviado para moderação e logo será publicado.');
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
          <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>Novo Vídeo</Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark ? styles.textDark : styles.textLight]}>Título</Text>
            <TextInput
              style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
              placeholder="Ex: Pegadinha engraçada"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark ? styles.textDark : styles.textLight]}>Link do Vídeo (YouTube, TikTok, Instagram)</Text>
            <TextInput
              style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
              placeholder="https://..."
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={videoUrl}
              onChangeText={setVideoUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark ? styles.textDark : styles.textLight]}>Tags (separadas por vírgula)</Text>
            <TextInput
              style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
              placeholder="ex: engraçado, tiktok, fail"
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
  submitButton: {
    backgroundColor: '#EF4444',
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
