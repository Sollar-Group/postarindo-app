import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { i18n } from '../lib/i18n';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        Alert.alert('Erro no Cadastro', error.message);
      } else {
        Alert.alert('Sucesso', 'Verifique seu e-mail para confirmar a conta.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert('Erro no Login', error.message);
      } else {
        router.replace('/');
      }
    }

    setLoading(false);
  }

  return (
    <View style={[styles.container, { backgroundColor: '#111827' }]}>
      <View style={[styles.card, { backgroundColor: '#1f2937' }]}>
        <Text style={[styles.title, { color: '#F9FAFB' }]}>
          {isSignUp ? 'Criar Conta' : 'Acesse sua Conta'}
        </Text>

        <TextInput
          style={[styles.input, { backgroundColor: '#374151', color: '#F9FAFB', borderColor: '#4B5563' }]}
          placeholder={i18n.t('login.email_placeholder')}
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={[styles.input, { backgroundColor: '#374151', color: '#F9FAFB', borderColor: '#4B5563' }]}
          placeholder={i18n.t('login.senha_placeholder')}
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>{isSignUp ? i18n.t('login.titulo_cadastrar') : i18n.t('login.titulo_entrar')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.toggleContainer}>
          <Text style={[styles.toggleText, { color: '#D1D5DB' }]}>
            {isSignUp ? i18n.t('login.alternar_para_entrar') : i18n.t('login.alternar_para_cadastrar')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3B82F6',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
  },
});
