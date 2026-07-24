import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { i18n } from './i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'pt-BR' | 'en-US' | 'es-ES';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'pt-BR',
  setLanguage: async () => {},
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(
    (i18n.locale.startsWith('pt') ? 'pt-BR' : i18n.locale.startsWith('es') ? 'es-ES' : 'en-US') as Language
  );

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLang = await AsyncStorage.getItem('user_language');
        if (storedLang === 'pt-BR' || storedLang === 'en-US' || storedLang === 'es-ES') {
          setLanguageState(storedLang as Language);
          i18n.locale = storedLang;
        }
      } catch (e) {
        console.error('Failed to load language', e);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    i18n.locale = lang;
    try {
      await AsyncStorage.setItem('user_language', lang);
    } catch (e) {
      console.error('Failed to save language', e);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
