// src/utils/glossMapper.ts
export type Dialect = 'PSL' | 'ISL';

// Simple dictionary mapping for common structural shifts
const QUESTION_WORDS = ['what', 'why', 'where', 'when', 'how', 'who'];

/**
 * Transforms spoken English sentences into structured Sign Language Gloss syntax.
 */
export function convertToSignGloss(sentence: string, _dialect: Dialect = 'PSL'): string[] {
  // 1. Clean and tokenize the input text
  let words = sentence
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "") // Strip punctuation
    .split(/\s+/)
    .filter((word) => word.trim() !== "");

  // 2. Remove structural filler elements not present in visual signing
  const stopWords = new Set([
    'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
    'the', 'a', 'an', 'to'
  ]);
  words = words.filter((word) => !stopWords.has(word));

  if (words.length <= 1) return words.map((w) => w.toUpperCase());

  // 3. Apply grammar mapping rules: Move question words to the absolute end of the array
  let detectedQuestionWord: string | null = null;
  const reorderedWords: string[] = [];

  for (const word of words) {
    if (QUESTION_WORDS.includes(word)) {
      detectedQuestionWord = word;
    } else {
      reorderedWords.push(word);
    }
  }

  // Dialect adjustments (Example: handling subtle positioning adjustments if needed)
  if (detectedQuestionWord) {
    reorderedWords.push(detectedQuestionWord);
  }

  // 4. Return as uppercase GLOSS tokens (the standard convention for sign notation)
  return reorderedWords.map((word) => word.toUpperCase());
}
