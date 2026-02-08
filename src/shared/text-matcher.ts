import type { ResolvedKeyword } from './keyword-resolver';

export interface TextMatchResult {
  index: number;
  matchedText: string;
}

/**
 * Finds the first match of a resolved keyword in a text string.
 * Encapsulates the regex vs. plain-text matching strategy for reader mode.
 */
export function findTextMatch(text: string, resolved: ResolvedKeyword, caseSensitive: boolean): TextMatchResult | null {
  if (resolved.type === 'regex') {
    const regexp = new RegExp(resolved.pattern, 'g');
    regexp.lastIndex = 0;
    const match = regexp.exec(text);
    return match ? { index: match.index, matchedText: match[0] } : null;
  }

  const index = caseSensitive ? text.indexOf(resolved.text) : text.toLowerCase().indexOf(resolved.text.toLowerCase());
  if (index === -1) return null;
  return { index, matchedText: text.substring(index, index + resolved.text.length) };
}
