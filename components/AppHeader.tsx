import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, useColorScheme, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={[styles.loginText, isDark ? styles.loginTextDark : styles.loginTextLight]}>
            Entrar / Cadastrar
          </Text>
        </TouchableOpacity>
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
  loginText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginTextLight: {
    color: '#111827',
  },
  loginTextDark: {
    color: '#F9FAFB',
  }
});
