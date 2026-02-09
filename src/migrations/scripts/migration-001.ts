import type { MigrationScript, SettingsData } from '../types';

/**
 * Migration 001: Add settingsVersion and globalSettings
 *
 * Transforms data from version 0 (legacy, no settingsVersion) to version 1
 *
 * Changes:
 * - Adds settingsVersion: 1 field to data.json
 * - Adds globalSettings.caseSensitive: true (preserves existing behavior)
 * - Ensures keywords array exists
 *
 * Idempotency:
 * - If settingsVersion already exists, backfills missing fields only
 * - Safe to run multiple times
 */
export class Migration001 implements MigrationScript {
  readonly version = 1;
  readonly name = 'Add settingsVersion and globalSettings';

  /**
   * Execute migration from v0 to v1
   *
   * @param data - Input data at version 0
   * @returns Promise resolving to data at version 1
   */
  async execute(data: SettingsData): Promise<SettingsData> {
    // Check if already at version 1
    if (data.settingsVersion === 1) {
      // Backfill caseSensitive for v1 settings created before this field existed
      const result = { ...data };
      if (!result.globalSettings) {
        result.globalSettings = { caseSensitive: true };
      } else if (result.globalSettings.caseSensitive === undefined) {
        result.globalSettings = {
          ...result.globalSettings,
          caseSensitive: true,
        };
      }
      return result;
    }

    // Migrate from v0 (no settingsVersion) to v1
    if (data.settingsVersion === undefined) {
      return {
        ...data,
        settingsVersion: 1,
        globalSettings: {
          caseSensitive: true, // preserve existing behavior (case-sensitive by default)
        },
        keywords: Array.isArray(data.keywords) ? data.keywords : [],
      };
    }

    // Already migrated to a version > 1, return as-is
    return data;
  }

  /**
   * Validate data is at version 1
   *
   * @param data - Data to validate
   * @returns true if data has settingsVersion === 1 and required fields
   */
  validate(data: SettingsData): boolean {
    if (data.settingsVersion !== 1) {
      return false;
    }

    // Verify globalSettings exists
    if (!data.globalSettings || typeof data.globalSettings !== 'object') {
      return false;
    }

    // Verify caseSensitive field exists
    if (typeof data.globalSettings.caseSensitive !== 'boolean') {
      return false;
    }

    // Verify keywords array exists
    if (!Array.isArray(data.keywords)) {
      return false;
    }

    return true;
  }
}
