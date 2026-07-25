// 1. Injeta o Polyfill globalmente ANTES de tudo
if (typeof global.DOMException === 'undefined') {
  global.DOMException = class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name || 'DOMException';
    }
  };
}

// 2. Chama o ponto de entrada original do Expo Router
import 'expo-router/entry';
