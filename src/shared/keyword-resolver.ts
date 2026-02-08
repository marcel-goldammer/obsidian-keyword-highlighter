/**
 * Keyword resolution utility.
 *
 * Parses keyword strings into a discriminated union type representing
 * either plain text or regex-based keywords.
 *
 * Note: Does NOT pre-compile RegExp objects. The editor engine needs the
 * pattern string (RegExpCursor compiles internally with 'gm' flags).
 * The reader engine compiles its own RegExp with appropriate flags.
 */

export type ResolvedKeyword = { type: 'plain'; text: string } | { type: 'regex'; pattern: string };

/**
 * Resolves a keyword string into a typed ResolvedKeyword.
 *
 * @param keywordStr - The raw keyword string (e.g. "TODO" or "/todo|fixme/")
 * @param caseSensitive - Whether matching is case-sensitive. Passed through for
 *   consumers to apply when creating cursors/patterns. Does NOT affect regex
 *   keywords — regex users control their own flags via pattern syntax.
 * @returns ResolvedKeyword on success, or null for empty/invalid input
 */
export function resolveKeyword(keywordStr: string, caseSensitive: boolean): ResolvedKeyword | null {
  if (!keywordStr) {
    return null;
  }

  // Detect /pattern/ syntax: starts with '/', ends with '/', and length > 2
  if (keywordStr.startsWith('/') && keywordStr.endsWith('/') && keywordStr.length > 2) {
    const pattern = keywordStr.slice(1, -1);
    try {
      new RegExp(pattern);
    } catch {
      // Silent failure for invalid regex patterns (per user decision)
      return null;
    }
    return { type: 'regex', pattern };
  }

  // Plain text keyword (including multi-word with spaces).
  // The caseSensitive parameter is for consumers to use when building
  // search cursors or compiled RegExp instances.
  return { type: 'plain', text: keywordStr };
}
