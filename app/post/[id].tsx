import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, SafeAreaView, useColorScheme, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Post, Comentario } from '../../types';
import { PostCard } from '../../components/PostCard';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';
import { useLanguage } from '../../lib/LanguageContext';

export default function PostDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { language } = useLanguage();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [post, setPost] = useState<Post | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoComentario, setNovoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPostDetails();
      fetchComentarios();
    }
  }, [id]);

  const fetchPostDetails = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, autor:users!posts_autor_id_fkey(nome_exibicao, avatar_url, instagram_handle), comentarios(count)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching post details:', error);
      Alert.alert('Erro', 'Não foi possível carregar o post.');
    } else if (data) {
      const postWithCommentsCount = {
        ...data,
        comentariosCount: data.comentarios?.[0]?.count || 0,
      };
      setPost(postWithCommentsCount as Post);
    }
    setLoading(false);
  };

  const fetchComentarios = async () => {
    const { data, error } = await supabase
      .from('comentarios')
      .select('*, autor:users!comentarios_autor_id_fkey(nome_exibicao, avatar_url, instagram_handle)')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comentarios:', error);
    } else if (data) {
      setComentarios(data as Comentario[]);
    }
  };

  const handleEnviarComentario = async () => {
    if (!novoComentario.trim()) return;

    setEnviando(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      Alert.alert('Login Necessário', 'Você precisa estar logado para comentar.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Fazer Login', onPress: () => router.push('/login') }
      ]);
      setEnviando(false);
      return;
    }

    const { error } = await supabase
      .from('comentarios')
      .insert({
        post_id: id,
        autor_id: session.user.id,
        conteudo: novoComentario.trim()
      });

    if (error) {
      console.error('Error inserting comentario:', error);
      Alert.alert('Erro', 'Não foi possível enviar o comentário.');
    } else {
      setNovoComentario('');
      fetchComentarios(); // Recarrega os comentários para atualizar a lista
      fetchPostDetails(); // Atualiza contador de comentarios
    }
    setEnviando(false);
  };

  const renderComentario = ({ item }: { item: Comentario }) => {
    const dateLocale = language === 'pt-BR' ? ptBR : language === 'es-ES' ? es : enUS;
    const timeAgo = item.created_at ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: dateLocale }) : '';
    const initial = item.autor?.nome_exibicao?.charAt(0).toUpperCase() || '?';

    return (
      <View style={[styles.comentarioContainer, isDark ? styles.comentarioDark : styles.comentarioLight]}>
        {item.autor?.avatar_url ? (
           <Image source={{ uri: item.autor.avatar_url }} style={styles.avatar} />
        ) : (
           <View style={styles.avatarPlaceholder}>
             <Text style={styles.avatarText}>{initial}</Text>
           </View>
        )}
        <View style={styles.comentarioContent}>
          <View style={styles.comentarioHeader}>
            <Text style={[styles.comentarioAuthor, isDark ? styles.textDark : styles.textLight]}>
              {item.autor?.nome_exibicao || 'Usuário'}
            </Text>
            <Text style={styles.comentarioTime}>{timeAgo}</Text>
          </View>
          <Text style={[styles.comentarioText, isDark ? styles.textDark : styles.textLight]}>
            {item.conteudo}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, isDark ? styles.containerDark : styles.containerLight]}>
        <ActivityIndicator size="large" color={isDark ? "#FFFFFF" : "#000000"} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={comentarios}
          keyExtractor={(item) => item.id}
          renderItem={renderComentario}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={() => (
            <View style={styles.headerComponent}>
              {post && <PostCard post={post} disableLink={true} />}
              <Text style={[styles.comentariosTitle, isDark ? styles.textDark : styles.textLight]}>
                Comentários ({comentarios.length})
              </Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, isDark ? styles.textDark : styles.textLight]}>
                Nenhum comentário ainda. Seja o primeiro!
              </Text>
            </View>
          )}
        />

        <View style={[styles.inputContainer, isDark ? styles.inputContainerDark : styles.inputContainerLight]}>
          <TextInput
            style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
            placeholder="Escreva um comentário..."
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            value={novoComentario}
            onChangeText={setNovoComentario}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !novoComentario.trim() && styles.sendButtonDisabled]}
            onPress={handleEnviarComentario}
            disabled={!novoComentario.trim() || enviando}
          >
            {enviando ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.sendButtonText}>Enviar</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#F3F4F6',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  headerComponent: {
    marginBottom: 16,
  },
  comentariosTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
  },
  comentarioContainer: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  comentarioLight: {
    backgroundColor: '#FFFFFF',
  },
  comentarioDark: {
    backgroundColor: '#1F2937',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  comentarioContent: {
    flex: 1,
  },
  comentarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  comentarioAuthor: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  comentarioTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  comentarioText: {
    fontSize: 15,
    lineHeight: 22,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#6B7280',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  inputContainerLight: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E7EB',
  },
  inputContainerDark: {
    backgroundColor: '#1F2937',
    borderTopColor: '#374151',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    marginRight: 12,
  },
  inputLight: {
    backgroundColor: '#F3F4F6',
    color: '#111827',
  },
  inputDark: {
    backgroundColor: '#374151',
    color: '#F9FAFB',
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
    color: '#F9FAFB',
  },
});
