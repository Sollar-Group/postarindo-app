import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { i18n } from '../../lib/i18n';
import { Image as ImageIcon, MessageSquare, HelpCircle, Quote, Video } from 'lucide-react-native';

const POST_TYPES = [
  { id: 'piada', title: i18n.t('postar.piada'), icon: MessageSquare, route: '/postar/piada', color: '#3B82F6', description: 'Conte algo engraçado' },
  { id: 'charada', title: i18n.t('postar.charada'), icon: HelpCircle, route: '/postar/charada', color: '#10B981', description: 'Desafie os outros' },
  { id: 'frase', title: i18n.t('postar.frase'), icon: Quote, route: '/postar/frase', color: '#8B5CF6', description: 'Compartilhe sabedoria' },
  { id: 'imagem', title: i18n.t('postar.imagem'), icon: ImageIcon, route: '/postar/imagem', color: '#F59E0B', description: 'Uma foto vale mais que 1000 palavras' },
  { id: 'video', title: i18n.t('postar.video'), icon: Video, route: '/postar/video', color: '#EF4444', description: 'Compartilhe um momento' },
];

export default function PostarIndex() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.bgDark : styles.bgLight]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
          {i18n.t('postar.titulo')}
        </Text>
        <Text style={[styles.subtitle, isDark ? styles.textMutedDark : styles.textMutedLight]}>
          Escolha o tipo de conteúdo
        </Text>

        <View style={styles.grid}>
          {POST_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}
              onPress={() => router.push(type.route as any)}
            >
              <View style={[styles.iconContainer, { backgroundColor: type.color + '20' }]}>
                <type.icon size={32} color={type.color} />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, isDark ? styles.textDark : styles.textLight]}>{type.title}</Text>
                <Text style={[styles.cardDesc, isDark ? styles.textMutedDark : styles.textMutedLight]}>{type.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  bgLight: {
    backgroundColor: '#F3F4F6',
  },
  bgDark: {
    backgroundColor: '#111827',
  },
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  grid: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
    color: '#F9FAFB',
  },
  textMutedLight: {
    color: '#6B7280',
  },
  textMutedDark: {
    color: '#9CA3AF',
  }
});
