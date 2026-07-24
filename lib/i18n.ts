import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';

import ptBR from '../dictionaries/pt-BR.json';
import enUS from '../dictionaries/en-US.json';
import esES from '../dictionaries/es-ES.json';

// Create an i18n instance
const i18n = new I18n({
  'pt-BR': ptBR,
  'pt-PT': ptBR, // Fallback for Portugal Portuguese
  'pt': ptBR,
  'en-US': enUS,
  'en-GB': enUS,
  'en': enUS,
  'es-ES': esES,
  'es-MX': esES,
  'es': esES,
});

// Set default locale
i18n.defaultLocale = 'pt-BR';

// Enable fallback to default locale
i18n.enableFallback = true;

// Get the user's preferred locale from the device
const locales = getLocales();
if (locales && locales.length > 0) {
  i18n.locale = locales[0].languageTag;
} else {
  i18n.locale = 'pt-BR'; // Fallback
}

export { i18n };
