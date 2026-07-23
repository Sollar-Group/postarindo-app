import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, useColorScheme, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlusCircle } from 'lucide-react-native';

export function AppHeader() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.headerContainer,
      isDark ? styles.headerDark : styles.headerLight,
      { paddingTop: insets.top }
    ]}>
      <View style={styles.headerContent}>
        <Image
          source={require('../assets/app-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.actions}>
          <TouchableOpacity style={styles.publishBtn} onPress={() => router.push('/postar')}>
            <PlusCircle size={20} color={isDark ? '#FFFFFF' : '#111827'} />
            <Text style={[styles.publishText, isDark ? styles.textDark : styles.textLight]}>
              Publicar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/login')} style={styles.loginBtn}>
            <Text style={[styles.loginText, isDark ? styles.textDark : styles.textLight]}>
              Entrar / Cadastrar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    borderBottomWidth: 1,
  },
  headerContent: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerLight: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E7EB',
  },
  headerDark: {
    backgroundColor: '#1F2937',
    borderBottomColor: '#374151',
  },
  logo: {
    height: 32,
    width: 120,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  publishText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginBtn: {
    marginLeft: 8,
  },
  loginText: {
    fontSize: 14,
    fontWeight: '600',
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
    color: '#F9FAFB',
  }
});
