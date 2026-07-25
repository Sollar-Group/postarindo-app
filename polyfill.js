// 1. O HACK DO EVENT.NONE
// Destranca as propriedades nativas do React Native para o Supabase não explodir
if (global.Event) {
  try {
    ['NONE', 'CAPTURING_PHASE', 'AT_TARGET', 'BUBBLING_PHASE'].forEach(key => {
      Object.defineProperty(global.Event, key, { 
        configurable: true, 
        writable: true, 
        value: global.Event[key] !== undefined ? global.Event[key] : 0 
      });
    });
  } catch (e) {
    console.warn("Polyfill Event error:", e);
  }
}

// 2. A VACINA DO DOMException (Que já provou que funciona)
const MyDOMException = class DOMException extends Error {
  constructor(message, name) {
    super(message);
    this.name = name || 'DOMException';
  }
};

if (typeof global.DOMException === 'undefined') {
  global.DOMException = MyDOMException;
}
if (typeof globalThis !== 'undefined' && typeof globalThis.DOMException === 'undefined') {
  globalThis.DOMException = MyDOMException;
}
if (typeof window !== 'undefined' && typeof window.DOMException === 'undefined') {
  window.DOMException = MyDOMException;
}