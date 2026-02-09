import type { MigrationScript } from './types';

/**
 * Base migration script interface for strategy pattern
 *
 * Each migration script must implement this interface to transform
 * data from version N-1 to version N.
 *
 * @example
 * ```typescript
 * export class Migration001 implements MigrationScript {
 *   readonly version = 1;
 *   readonly name = "Add settingsVersion field";
 *
 *   async execute(data: SettingsData): Promise<SettingsData> {
 *     if (data.settingsVersion !== undefined) {
 *       return data;
 *     }
 *     return { ...data, settingsVersion: 1 };
 *   }
 *
 *   validate(data: SettingsData): boolean {
 *     return data.settingsVersion === 1;
 *   }
 * }
 * ```
 */

// Re-export for convenience
export type { MigrationScript };
