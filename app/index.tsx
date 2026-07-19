
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, SafeAreaView, useColorScheme, ActivityIndicator, TextInput, ScrollView, TouchableOpacity , Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Post } from '../types';
import { PostCard } from '../components/PostCard';

const CATEGORIES = ['Inicial', 'Charadas', 'Frases', 'Imagens', 'Piadas', 'Vídeos'];
const ITEMS_PER_PAGE = 10;

export default function App() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Inicial');
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchPosts();
  }, [activeCategory, page]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (page !== 0) {
        setPage(0);
      } else {
        fetchPosts();
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from('posts')
      .select('*, autor:users!posts_autor_id_fkey(nome_exibicao, avatar_url, instagram_handle)')
      .eq('status_aprovacao', 'aprovado')
      .order('published_at', { ascending: false })
      .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

    if (activeCategory !== 'Inicial') {
      let catFilter = activeCategory;
      if (activeCategory === 'Vídeos') catFilter = 'video';

      if (activeCategory === 'Vídeos') {
         query = query.eq('tipo', 'video');
      } else {
         query = query.eq('categoria', activeCategory);
      }
    }

    if (searchQuery.trim() !== '') {
      query = query.or(`conteudo.ilike.%${searchQuery}%,tags.cs.{"${searchQuery}"}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data as Post[]);
    }
    setLoading(false);
  };

  const renderFooter = () => {
    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.pageButton, page === 0 && styles.pageButtonDisabled]}
          disabled={page === 0}
          onPress={() => setPage((p: number) => Math.max(0, p - 1))}
        >
          <Text style={styles.pageButtonText}>Anterior</Text>
        </TouchableOpacity>
        <Text style={[styles.pageIndicator, isDark ? styles.textDark : styles.textLight]}>
          Página {page + 1}
        </Text>
        <TouchableOpacity
          style={[styles.pageButton, posts.length < ITEMS_PER_PAGE && styles.pageButtonDisabled]}
          disabled={posts.length < ITEMS_PER_PAGE}
          onPress={() => setPage((p: number) => p + 1)}
        >
          <Text style={styles.pageButtonText}>Seguinte</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <View style={[styles.filtersContainer, isDark ? styles.headerDark : styles.headerLight]}>
        {/* Categories */}
        <View style={styles.categoriesWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  activeCategory === cat ? styles.categoryPillActive : (isDark ? styles.categoryPillDark : styles.categoryPillLight)
                ]}
                onPress={() => {
                  setActiveCategory(cat);
                  setPage(0);
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === cat ? styles.categoryTextActive : (isDark ? styles.categoryTextDark : styles.categoryTextLight)
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Search Bar */}
        <TextInput
          style={[styles.searchInput, isDark ? styles.searchInputDark : styles.searchInputLight]}
          placeholder="Pesquisar..."
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading && posts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? "#FFFFFF" : "#000000"} />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item }: { item: Post }) => <PostCard post={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={renderFooter}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  loginButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  filtersContainer: {
    padding: 12,
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
  searchInput: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 12, // Added spacing from categories
  },
  searchInputLight: {
    backgroundColor: '#F3F4F6',
    color: '#111827',
  },
  searchInputDark: {
    backgroundColor: '#374151',
    color: '#F9FAFB',
  },
  categoriesWrapper: {
    height: 36,
  },
  categoriesScroll: {
    paddingRight: 16,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryPillActive: {
    backgroundColor: '#3B82F6',
  },
  categoryPillLight: {
    backgroundColor: '#E5E7EB',
  },
  categoryPillDark: {
    backgroundColor: '#374151',
  },
  categoryText: {
    fontWeight: '600',
    fontSize: 14,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  categoryTextLight: {
    color: '#4B5563',
  },
  categoryTextDark: {
    color: '#D1D5DB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  pageButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  pageButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  pageButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  pageIndicator: {
    fontWeight: '600',
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
    color: '#F9FAFB',
  },
});
