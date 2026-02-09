import { Plugin } from 'obsidian';
import type { IMigrationManager, MigrationScript, MigrationResult, SettingsData } from './types';
import { MigrationError, ValidationError, MIGRATION_CONFIG } from './types';
import { BackupManager } from './backup-manager';
import { DataValidator } from './data-validator';

/**
 * Central orchestrator for migration process
 *
 * Responsibilities:
 * - Registers migration scripts
 * - Detects version mismatches
 * - Creates backups before migration
 * - Executes migrations sequentially
 * - Handles rollback on failure
 *
 * Process:
 * 1. Load current data.json
 * 2. Detect version mismatch
 * 3. Create backup if migration needed
 * 4. Execute migrations sequentially (fromVersion+1 to toVersion)
 * 5. Validate final state
 * 6. Save migrated data
 * 7. Return result (or rollback on failure)
 */
export class MigrationManager implements IMigrationManager {
  readonly currentPluginVersion: number;
  private migrations: Map<number, MigrationScript>;
  private backupManager: BackupManager;
  private validator: DataValidator;

  constructor(
    private plugin: Plugin,
    currentVersion: number,
  ) {
    this.currentPluginVersion = currentVersion;
    this.migrations = new Map();
    this.backupManager = new BackupManager(plugin);
    this.validator = new DataValidator();
  }

  /**
   * Register a migration script
   *
   * @param migration - Migration script to register
   * @throws Error if version already registered
   */
  register(migration: MigrationScript): void {
    if (this.migrations.has(migration.version)) {
      throw new Error(`Migration version ${migration.version} is already registered`);
    }

    this.migrations.set(migration.version, migration);

    // Register validation function with validator
    this.validator.registerMigration(migration.version, (data) => migration.validate(data));
  }

  /**
   * Execute migration process
   *
   * Process:
   * 1. Load current data.json
   * 2. Detect version mismatch
   * 3. Create backup if migration needed
   * 4. Execute migrations sequentially (fromVersion+1 to toVersion)
   * 5. Validate final state
   * 6. Save migrated data
   * 7. Return result (or rollback on failure)
   *
   * @returns Promise resolving to MigrationResult
   */
  async migrate(): Promise<MigrationResult> {
    const startTime = Date.now();

    // Initialize result with default values
    const result: MigrationResult = {
      success: false,
      fromVersion: 0,
      toVersion: this.currentPluginVersion,
      migrationsApplied: 0,
      backupPath: null,
      error: null,
      durationMs: 0,
    };

    try {
      // Step 1: Load current data.json
      let data = (await this.plugin.loadData()) as SettingsData;

      // Handle fresh install - no data.json exists
      if (!data) {
        // Create new data with current version
        data = {
          settingsVersion: this.currentPluginVersion,
          keywords: [],
        };
        await this.plugin.saveData(data);

        result.success = true;
        result.fromVersion = this.currentPluginVersion;
        result.toVersion = this.currentPluginVersion;
        result.durationMs = Date.now() - startTime;

        return result;
      }

      // Step 2: Detect version (treat missing settingsVersion as version 0)
      const currentVersion = data.settingsVersion ?? MIGRATION_CONFIG.LEGACY_VERSION;
      result.fromVersion = currentVersion;

      // Check for no-op case (already at current version)
      if (currentVersion === this.currentPluginVersion) {
        result.success = true;
        result.toVersion = currentVersion;
        result.durationMs = Date.now() - startTime;

        return result;
      }

      // Check for downgrade (current > target)
      if (currentVersion > this.currentPluginVersion) {
        console.warn(`[Migration] Data version (${currentVersion}) is newer than plugin version (${this.currentPluginVersion}). Skipping migration.`);
        result.success = true;
        result.toVersion = currentVersion;
        result.durationMs = Date.now() - startTime;

        return result;
      }

      // Step 3: Create backup before any migration
      result.backupPath = await this.backupManager.createBackup(data, currentVersion, this.currentPluginVersion);

      // Step 4: Execute migrations sequentially
      let migratedData = data;
      for (let version = currentVersion + 1; version <= this.currentPluginVersion; version++) {
        const migration = this.migrations.get(version);
        if (!migration) {
          throw new MigrationError(`Migration script for version ${version} not found`, currentVersion, this.currentPluginVersion);
        }

        // Execute migration
        migratedData = await migration.execute(migratedData);
        result.migrationsApplied++;

        // Validate after each migration (checkpoint)
        if (!this.validator.validateForVersion(migratedData, version)) {
          throw new ValidationError(`Validation failed after migration to version ${version}`, version);
        }
      }

      // Step 5: Update settingsVersion in final data
      migratedData.settingsVersion = this.currentPluginVersion;

      // Step 6: Save migrated data
      await this.plugin.saveData(migratedData);

      // Success!
      result.success = true;
      result.toVersion = this.currentPluginVersion;
      result.durationMs = Date.now() - startTime;

      return result;
    } catch (error) {
      // TODO: Phase 5 implementation
      // - Automatic rollback
      // - Enhanced error logging

      result.success = false;
      result.error = error instanceof Error ? error : new Error(String(error));
      result.durationMs = Date.now() - startTime;

      console.error('[Migration] Migration failed:', result.error);

      return result;
    }
  }
}
