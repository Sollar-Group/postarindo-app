// 1. Remove o Event nativo read-only do React Native para o Supabase poder criar o dele
if (typeof global.Event !== 'undefined') {
  // @ts-ignore
  delete global.Event;
}

// 2. Injeta o DOMException globalmente para o Hermes
if (typeof global.DOMException === 'undefined') {
  // @ts-ignore
  global.DOMException = class DOMException extends Error {
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name || 'DOMException';
    }
  };
}

// 3. Garante o polyfill de URL via require (evitando hoisting do Babel)
require('react-native-url-polyfill/auto');

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
