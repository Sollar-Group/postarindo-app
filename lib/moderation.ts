const BLOCKLIST = [
  'palavrao1',
  'palavrao2',
  'ofensa',
  'xingamento',
  // Expand this list as needed.
];

export function findBlockedWord(text: string): string | null {
  const normalizedText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  for (const word of BLOCKLIST) {
    // Basic word boundary check.
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(normalizedText)) {
      return word;
    }
  }

  return null;
}
