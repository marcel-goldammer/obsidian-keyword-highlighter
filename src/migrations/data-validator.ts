import type { IDataValidator, SettingsData } from './types';

/**
 * Validates data.json structure before and after migrations
 *
 * Responsibilities:
 * - Validates basic data structure (required fields, types)
 * - Validates data matches expected structure for specific version
 * - Delegates version-specific validation to migration scripts
 */
export class DataValidator implements IDataValidator {
  private migrations: Map<number, { validate: (data: SettingsData) => boolean }>;

  constructor() {
    this.migrations = new Map();
  }

  /**
   * Register a migration script for version-specific validation
   *
   * @param version - Target version number
   * @param validate - Validation function from migration script
   */
  registerMigration(version: number, validate: (data: SettingsData) => boolean): void {
    this.migrations.set(version, { validate });
  }

  /**
   * Validate basic data structure (required fields, types)
   *
   * Checks:
   * - data is non-null object
   * - settingsVersion is number (if present)
   * - keywords is array
   *
   * @param data - Data to validate
   * @returns true if structure valid, false otherwise
   */
  validateStructure(data: unknown): boolean {
    // Check data is non-null object
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Type guard for property access
    const obj = data as Record<string, unknown>;

    // Check settingsVersion is number if present
    if (obj.settingsVersion !== undefined && typeof obj.settingsVersion !== 'number') {
      return false;
    }

    // Check keywords is array
    if (!Array.isArray(obj.keywords)) {
      return false;
    }

    return true;
  }

  /**
   * Validate data matches expected structure for specific version
   *
   * Delegates to migration script's validate() method
   *
   * @param data - Data to validate
   * @param version - Expected settingsVersion
   * @returns true if data valid for version, false otherwise
   */
  validateForVersion(data: SettingsData, version: number): boolean {
    // First check basic structure
    if (!this.validateStructure(data)) {
      return false;
    }

    // For version 0 (legacy), no settingsVersion field is expected
    if (version === 0) {
      return data.settingsVersion === undefined;
    }

    // Check settingsVersion matches expected version
    if (data.settingsVersion !== version) {
      return false;
    }

    // Delegate to migration script's validation if available
    const migration = this.migrations.get(version);
    if (migration) {
      return migration.validate(data);
    }

    // If no migration registered for this version, basic check is sufficient
    return true;
  }
}
