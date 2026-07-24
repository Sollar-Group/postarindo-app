import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { i18n } from "../lib/i18n";
import { AppHeader } from '../components/AppHeader';

export default function Layout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      },
      headerTintColor: isDark ? '#F9FAFB' : '#111827',
    }}>
      <Stack.Screen
        name="index"
        options={{
          header: () => <AppHeader />
        }}
      />
      <Stack.Screen name="login" options={{ title: i18n.t('login.titulo_entrar'), headerShown: true, headerBackTitle: i18n.t('login.voltar') }} />
      <Stack.Screen name="post/[id]" options={{ title: i18n.t('feed.detalhes') }} />
    </Stack>
  );
}
