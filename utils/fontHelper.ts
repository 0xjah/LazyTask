/**
 * Checks if the given text contains only English characters (and common punctuation/numbers)
 */
export function isEnglishText(text: string): boolean {
  if (!text) return true; // Default to English for empty text
  
  // Regex to match English letters, numbers, and common punctuation
  const englishRegex = /^[\x00-\x7F]*$/;
  
  return englishRegex.test(text);
}

/**
 * Returns the appropriate font family based on text content
 * Uses Iosevka-Term for English text, system font for other languages
 */
export function getFontFamily(text?: string): string {
  if (!text || isEnglishText(text)) {
    return 'Iosevka-Term';
  }
  
  return 'System'; // Use system font for non-English text
}

/**
 * Returns font family for style objects
 */
export function getFontStyle(text?: string): { fontFamily: string } {
  return { fontFamily: getFontFamily(text) };
}
