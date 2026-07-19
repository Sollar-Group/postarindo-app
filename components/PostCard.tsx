
import React, { useState } from 'react';
import { Link } from 'expo-router';
import { View, Text, Image, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
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
  'bg-slate-500': '#64748b',
  'bg-gray-500': '#6b7280',
  'bg-zinc-500': '#71717a',
  'bg-neutral-500': '#737373',
  'bg-stone-500': '#78716c',
  'bg-amber-500': '#f59e0b',
  'bg-lime-500': '#84cc16',
  'bg-emerald-500': '#10b981',
  'bg-cyan-500': '#06b6d4',
  'bg-sky-500': '#0ea5e9',
  'bg-violet-500': '#8b5cf6',
  'bg-fuchsia-500': '#d946ef',
  'bg-rose-500': '#f43f5e',
};

function resolveBackgroundColor(corFundo?: string, isDark?: boolean) {
  const defaultBg = isDark ? '#374151' : '#E5E7EB';
  if (!corFundo) return defaultBg;

  // Check if it's a direct match in colorMap
  if (colorMap[corFundo]) return colorMap[corFundo];

  // Try to find a matched tailwind color in a gradient string (fallback)
  const tokens = corFundo.split(' ');
  for (const token of tokens) {
    if (token.startsWith('from-')) {
      const color = token.replace('from-', 'bg-');
      if (colorMap[color]) return colorMap[color];
    }
    if (colorMap[token]) return colorMap[token];
  }

  // Return literal color if it looks like hex/rgb, otherwise default
  if (corFundo.startsWith('#') || corFundo.startsWith('rgb')) {
    return corFundo;
  }

  return defaultBg;
}

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

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [showRiddle, setShowRiddle] = useState(false);

  const authorName = post.anonimo ? 'Anônimo' : post.autor.nome_exibicao;
  const instagramHandle = post.autor.instagram_handle;
  const avatarUrl = post.autor.avatar_url;
  const votesBalance = post.upvotes - post.downvotes;


  let votesColor = isDark ? styles.textDark.color : styles.textLight.color;
  let votesPrefix = '';
  if (votesBalance > 0) {
    votesColor = '#22c55e';
    votesPrefix = '+';
  } else if (votesBalance < 0) {
    votesColor = '#ef4444';
  }

  const backgroundColor = resolveBackgroundColor(post.cor_fundo, isDark);
  const iconColor = isDark ? '#9CA3AF' : '#4B5563';
  const timeAgo = post.published_at ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true }) : '';

  const ytId = post.video_url ? getYouTubeId(post.video_url) : null;
  const tkId = post.video_url ? getTikTokId(post.video_url) : null;

  let parsedTags: string[] = [];
  if (Array.isArray(post.tags)) {
    parsedTags = post.tags;
  } else if (typeof post.tags === 'string') {
    parsedTags = (post.tags as string).split(',').map(t => t.trim()).filter(t => t.length > 0);
  }


  return (
    <Link href={`/post/${post.id}`} asChild>
      <TouchableOpacity style={StyleSheet.flatten([styles.card, isDark ? styles.cardDark : styles.cardLight])} activeOpacity={0.9}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.authorRow}>
          {post.anonimo || !avatarUrl ? (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{authorName.charAt(0).toUpperCase()}</Text>
            </View>
          ) : (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          )}
          <View style={styles.authorContainer}>
            <Text style={[styles.authorName, isDark ? styles.textDark : styles.textLight]}>
              {authorName}
            </Text>
            {instagramHandle && !post.anonimo && (
              <Text style={styles.instagramHandle}>@{instagramHandle}</Text>
            )}
          </View>
        </View>
        <Text style={styles.timeAgo}>{timeAgo}</Text>
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
              style={{ flex: 1, width: '100%', height: 250 }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsInlineMediaPlayback={true}
              allowsFullscreenVideo
              scrollEnabled={false}
            />
          ) : tkId ? (
            <WebView
              source={{ uri: `https://www.tiktok.com/embed/v2/${tkId}` }}
              style={{ flex: 1, width: '100%', height: 250 }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsInlineMediaPlayback={true}
              allowsFullscreenVideo
              scrollEnabled={false}
            />
          ) : (
             <WebView
              source={{ uri: post.video_url }}
              style={{ flex: 1, width: '100%', height: 250 }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsInlineMediaPlayback={true}
              allowsFullscreenVideo
              scrollEnabled={false}
            />
          )}
        </View>
      ) : null}


      {(post.tipo === 'texto' || post.tipo === 'charada') ? (
        <View style={[styles.textContent, { backgroundColor }]}>
          <Text style={[styles.bodyText, { color: '#FFFFFF' }]}>
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
            <Eye size={20} color={isDark ? '#F9FAFB' : '#111827'} style={styles.riddleIcon} />
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

      {/* Footer / Action Bar */}
      <View style={styles.footer}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={20} color={iconColor} />
            <Text style={[styles.actionText, { color: iconColor }]}>{post.comentariosCount ?? 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={20} color={iconColor} />
          </TouchableOpacity>
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.voteButton}>
            <ThumbsUp size={20} color={iconColor} />
          </TouchableOpacity>
          <Text style={[styles.votes, { color: votesColor }]}>{votesPrefix}{votesBalance}</Text>
          <TouchableOpacity style={styles.voteButton}>
            <ThumbsDown size={20} color={iconColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tags */}
      {parsedTags.length > 0 && (
        <View style={styles.tagsContainer}>
          {parsedTags.map((tag: string, index: number) => (
            <Text key={index} style={[styles.tag, isDark ? styles.tagDark : styles.tagLight]}>
              #{tag}
            </Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  cardDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#D1D5DB',
  },
  authorContainer: {
    flexDirection: 'column',
  },
  authorName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  instagramHandle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  timeAgo: {
    fontSize: 12,
    color: '#6B7280',
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
    backgroundColor: '#E5E7EB',
  },
  videoContainer: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  video: {
    flex: 1,
  },
  textContent: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 100,
    justifyContent: 'center',
  },
  bodyText: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    fontWeight: '500',
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
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  voteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  votes: {
    fontWeight: '600',
    fontSize: 16,
    marginHorizontal: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 16,
  },
  tag: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tagLight: {
    backgroundColor: '#F3F4F6',
    color: '#4B5563',
  },
  tagDark: {
    backgroundColor: '#374151',
    color: '#D1D5DB',
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
    color: '#F9FAFB',
  },
});
