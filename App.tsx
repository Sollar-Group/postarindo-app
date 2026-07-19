import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, SafeAreaView, useColorScheme, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Post } from './types';
import { PostCard } from './components/PostCard';

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*, autor:users!posts_autor_id_fkey(nome_exibicao, avatar_url)')
      .eq('status_aprovacao', 'aprovado')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data as Post[]);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight]}>
        <Text style={[styles.headerTitle, isDark ? styles.textDark : styles.textLight]}>
          PostaRindo
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? "#FFFFFF" : "#000000"} />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item }) => <PostCard post={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#F3F4F6', // Neutral light background
  },
  containerDark: {
    backgroundColor: '#111827', // Neutral dark background
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerLight: {
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  headerDark: {
    borderBottomColor: '#374151',
    backgroundColor: '#1F2937',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
    color: '#F9FAFB',
  },
});
