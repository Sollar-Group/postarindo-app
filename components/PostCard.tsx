import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, useColorScheme, TouchableOpacity, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { Eye, ThumbsUp, ThumbsDown, MessageCircle, Share2 } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
}

const colorMap: Record<string, string> = {
  'bg-red-500': '#ef4444',
  'bg-blue-500': '#3b82f6',
  'bg-green-500': '#22c55e',
  'bg-yellow-500': '#eab308',
  'bg-purple-500': '#a855f7',
  'bg-pink-500': '#ec4899',
  'bg-indigo-500': '#6366f1',
  'bg-teal-500': '#14b8a6',
  'bg-orange-500': '#f97316',
};

function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function getTikTokId(url: string) {
  const regExp = /tiktok\.com\/(?:@[\w.-]+\/video\/|v\/|embed\/v2\/)(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export const PostCard: React.FC<PostCardProps> = ({ post }: PostCardProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [showRiddle, setShowRiddle] = useState(false);

  const authorName = post.anonimo ? 'Anônimo' : post.autor.nome_exibicao;
  const instagramHandle = post.autor.instagram_handle;
  const votesBalance = post.upvotes - post.downvotes;

  let backgroundColor = isDark ? '#374151' : '#E5E7EB';
  if (post.cor_fundo && colorMap[post.cor_fundo]) {
    backgroundColor = colorMap[post.cor_fundo];
  } else if (post.cor_fundo) {
    backgroundColor = post.cor_fundo;
  }

  const iconColor = isDark ? '#F9FAFB' : '#111827';
  const timeAgo = post.published_at ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true }) : '';

  const ytId = post.video_url ? getYouTubeId(post.video_url) : null;
  const tkId = post.video_url ? getTikTokId(post.video_url) : null;

  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.authorContainer}>
          <Text style={[styles.authorName, isDark ? styles.textDark : styles.textLight]}>
            {authorName}
          </Text>
          {instagramHandle && (
            <Text style={styles.instagramHandle}>@{instagramHandle}</Text>
          )}
        </View>
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

      {post.tipo === 'video' && post.video_url ? (
        <View style={styles.videoContainer}>
          {ytId ? (
            <WebView
              source={{ uri: `https://www.youtube.com/embed/${ytId}` }}
              style={styles.video}
              allowsFullscreenVideo
              scrollEnabled={false}
            />
          ) : tkId ? (
            <WebView
              source={{ uri: `https://www.tiktok.com/embed/v2/${tkId}` }}
              style={styles.video}
              allowsFullscreenVideo
              scrollEnabled={false}
            />
          ) : (
             <WebView
              source={{ uri: post.video_url }}
              style={styles.video}
              allowsFullscreenVideo
              scrollEnabled={false}
            />
          )}
        </View>
      ) : null}

      {(post.tipo === 'texto' || post.tipo === 'charada') ? (
        <View style={[styles.textContent, { backgroundColor }]}>
          <Text style={[styles.bodyText, isDark ? styles.textDark : styles.textLight]}>
            {post.conteudo}
          </Text>
        </View>
      ) : null}

      {post.categoria === 'Charadas' && post.resposta_charada && (
        <View style={styles.riddleContainer}>
          <TouchableOpacity
            style={styles.riddleToggle}
            onPress={() => setShowRiddle(!showRiddle)}
          >
            <Eye size={20} color={iconColor} style={styles.riddleIcon} />
            <Text style={[styles.riddleToggleText, isDark ? styles.textDark : styles.textLight]}>
              {showRiddle ? 'Ocultar Resposta' : 'Mostrar Resposta'}
            </Text>
          </TouchableOpacity>
          {showRiddle && (
            <Text style={[styles.riddleAnswer, isDark ? styles.textDark : styles.textLight]}>
              {post.resposta_charada}
            </Text>
          )}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.metadataContainer}>
          <Text style={styles.timeAgo}>{timeAgo}</Text>
          {post.tags && post.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {post.tags.map((tag: string, index: number) => (
                <Text key={index} style={styles.tag}>#{tag}</Text>
              ))}
            </View>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <View style={styles.interactions}>
            <TouchableOpacity style={styles.voteButton}>
              <ThumbsUp size={20} color={iconColor} />
            </TouchableOpacity>
            <Text style={[styles.votes, isDark ? styles.textDark : styles.textLight]}>
              {votesBalance}
            </Text>
            <TouchableOpacity style={styles.voteButton}>
              <ThumbsDown size={20} color={iconColor} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={20} color={iconColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={20} color={iconColor} />
          </TouchableOpacity>
        </View>
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
  authorContainer: {
    flexDirection: 'column',
  },
  authorName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  instagramHandle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
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
  videoContainer: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  video: {
    flex: 1,
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
  riddleContainer: {
    marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 12,
    borderRadius: 8,
  },
  riddleToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riddleIcon: {
    marginRight: 8,
  },
  riddleToggleText: {
    fontWeight: '600',
  },
  riddleAnswer: {
    marginTop: 12,
    fontStyle: 'italic',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  voteButton: {
    padding: 4,
  },
  actionButton: {
    padding: 4,
    marginLeft: 12,
  },
  votes: {
    fontWeight: '600',
    fontSize: 16,
    marginHorizontal: 8,
  },
  metadataContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginRight: 16,
  },
  timeAgo: {
    fontSize: 12,
    color: '#6B7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  tag: {
    fontSize: 12,
    color: '#3B82F6',
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
    color: '#F9FAFB',
  },
});
