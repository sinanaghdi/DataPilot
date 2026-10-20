// Persian text normalization and preprocessing for rule-based NLP

// Arabic to Persian character mapping
const CHAR_MAP: Record<string, string> = {
  'ي': 'ی',
  'ى': 'ی',
  'ك': 'ک',
  'ة': 'ه',
  'ۀ': 'ه',
  'آ': 'ا',
  'أ': 'ا',
  'إ': 'ا',
  'ؤ': 'و',
  'ئ': 'ی',
};

// Persian and Arabic digits to English
const DIGIT_MAP: Record<string, string> = {
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

// Arabic diacritics (اعراب)
const DIACRITICS_REGEX = /[\u064B-\u065F\u0670]/g;

// Common Persian stop words to ignore when extracting entities, but preserve intent markers
export const PERSIAN_STOP_WORDS = new Set([
  'از', 'به', 'با', 'در', 'تا', 'بر', 'برای', 'که', 'و', 'یا', 'را', 'رو',
  'این', 'آن', 'است', 'هست', 'بود', 'شد', 'شود', 'شدن', 'کرد', 'کند',
  'کنید', 'بفرمایید', 'لطفا', 'لطفاً', 'من', 'ما', 'تو', 'شما', 'او', 'آنها',
  'یک', 'یکی', 'چند', 'هم', 'نیز', 'اما', 'ولی', 'اگر', 'چون', 'درباره',
  'مورد', 'بابت', 'بگو', 'میخوام', 'می‌خواهم', 'میشه', 'می‌شود', 'ببینم',
]);

/**
 * Normalizes Persian text:
 * 1. Unifies Arabic/Persian letter variants (ی، ک، ه)
 * 2. Normalizes zero-width non-joiners (\u200c) to space or clean boundaries
 * 3. Strips diacritics
 * 4. Normalizes Persian & Arabic digits to standard English digits
 * 5. Removes excess whitespace and punctuation
 */
export function normalizePersianText(text: string): string {
  if (!text) return '';

  let normalized = text;

  // 1. Remove diacritics (fatha, damma, kasra, tanween, etc.)
  normalized = normalized.replace(DIACRITICS_REGEX, '');

  // 2. Character replacements
  normalized = normalized
    .split('')
    .map((char) => {
      if (CHAR_MAP[char]) return CHAR_MAP[char];
      if (DIGIT_MAP[char]) return DIGIT_MAP[char];
      return char;
    })
    .join('');

  // 3. Normalize zero-width non-joiners to space or remove redundant
  normalized = normalized.replace(/[\u200C\u200B\u200E\u200F]/g, ' ');

  // 4. Replace punctuation and symbols with space
  normalized = normalized.replace(/[؟?!\.,;:؛،\-\(\)\[\]{}'"\\\/><+=_*&^%$#@~`|]/g, ' ');

  // 5. Unify whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim().toLowerCase();

  return normalized;
}

/**
 * Tokenizes normalized Persian text into word tokens
 */
export function tokenizePersianText(text: string): string[] {
  const norm = normalizePersianText(text);
  if (!norm) return [];
  return norm.split(' ').filter((token) => token.length > 0);
}

/**
 * Strips common Persian grammatical affixes for basic stem matching
 */
export function stemPersianWord(word: string): string {
  let stem = word;

  // Prefixes (می, بی, ن)
  if (stem.startsWith('می') && stem.length > 4) {
    stem = stem.slice(2);
  } else if (stem.startsWith('بی') && stem.length > 4) {
    stem = stem.slice(2);
  }

  // Plurals and suffixes (ها, های, تان, شان, مان, ان, ین, تر, ترین, ات)
  const suffixes = ['ترین', 'هایمان', 'هایتان', 'هایشان', 'های', 'ها', 'مان', 'تان', 'شان', 'تر', 'ات', 'ان', 'ین'];
  for (const suf of suffixes) {
    if (stem.endsWith(suf) && stem.length > suf.length + 2) {
      stem = stem.slice(0, -suf.length);
      break;
    }
  }

  return stem;
}

/**
 * Checks if normalized text contains any phrase from list
 */
export function containsAny(text: string, phrases: string[]): boolean {
  const norm = normalizePersianText(text);
  return phrases.some((p) => {
    const normPhrase = normalizePersianText(p);
    return norm.includes(normPhrase);
  });
}
