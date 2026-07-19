import React from 'react';
import { View, Text, Image, StyleSheet, useColorScheme } from 'react-native';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const authorName = post.anonimo ? 'Anônimo' : post.autor.nome_exibicao;
  const votesBalance = post.upvotes - post.downvotes;

  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.authorName, isDark ? styles.textDark : styles.textLight]}>
          {authorName}
        </Text>
        <Text style={styles.category}>{post.categoria}</Text>
      </View>

      {/* Content */}
      <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
        {post.titulo}
      </Text>

      {post.tipo === 'imagem' && post.imagem_url ? (
        <Image
          source={{ uri: post.imagem_url }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : null}

      {post.tipo === 'texto' ? (
        <View style={[styles.textContent, { backgroundColor: post.cor_fundo || (isDark ? '#374151' : '#E5E7EB') }]}>
          <Text style={[styles.bodyText, isDark ? styles.textDark : styles.textLight]}>
            {post.conteudo}
          </Text>
        </View>
      ) : null}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.votes, isDark ? styles.textDark : styles.textLight]}>
          Votes: {votesBalance}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
  },
  cardDark: {
    backgroundColor: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  category: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  textContent: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 8,
  },
  votes: {
    fontWeight: '500',
    fontSize: 14,
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
    color: '#F9FAFB',
  },
});
