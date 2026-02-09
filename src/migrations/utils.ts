/**
 * Utility functions for migration system
 */

/**
 * Generate timestamp string in YYYYMMDD-HHMMSS format
 *
 * @returns Timestamp string (e.g., "20260209-143052")
 *
 * @example
 * ```typescript
 * const timestamp = generateTimestamp();
 * // Returns: "20260209-143052"
 * ```
 */
export function generateTimestamp(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}
