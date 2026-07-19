import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

export function AppHeader() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight]}>
      <Image
        source={require('../assets/app-icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <TouchableOpacity onPress={() => router.push('/login')}>
        <Image
          source={{ uri: 'https://cdn.lucide.dev/icons/user.svg' }} // Placeholder or replace with text
          style={{ width: 24, height: 24, tintColor: isDark ? '#FFF' : '#000' }}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
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
  }
});
