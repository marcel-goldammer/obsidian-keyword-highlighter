import { Plugin } from 'obsidian';
import type { IBackupManager, SettingsData } from './types';
import { BackupError } from './types';
import { generateTimestamp } from './utils';

/**
 * Manages backup file operations for migration system
 *
 * Responsibilities:
 * - Creates timestamped backups before migrations
 * - Generates consistent backup filenames
 * - Restores data from backup files
 *
 * Storage location: .obsidian/plugins/keyword-highlighter/
 * Naming convention: data-backup-v{OLD}-to-v{NEW}-YYYYMMDD-HHMMSS.json
 */
export class BackupManager implements IBackupManager {
  constructor(private plugin: Plugin) {}

  /**
   * Create backup file before migration
   *
   * @param data - Current settings data to backup
   * @param fromVersion - Current settingsVersion
   * @param toVersion - Target settingsVersion
   * @returns Promise resolving to backup file path
   * @throws BackupError if backup creation fails
   */
  async createBackup(data: SettingsData, fromVersion: number, toVersion: number): Promise<string> {
    try {
      const filename = this.generateFilename(fromVersion, toVersion);
      const pluginDir = this.plugin.manifest.dir || '';
      const backupPath = `${pluginDir}/${filename}`;

      // Serialize data to JSON
      const jsonData = JSON.stringify(data, null, 2);

      // Write to vault using Obsidian API
      await this.plugin.app.vault.adapter.write(backupPath, jsonData);

      return backupPath;
    } catch (error) {
      throw new BackupError(
        `Failed to create backup: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Restore data.json from backup file
   *
   * @param backupPath - Path to backup file
   * @returns Promise resolving to restored data
   * @throws BackupError if restore fails
   */
  async restore(backupPath: string): Promise<SettingsData> {
    try {
      // Read backup file using Obsidian API
      const jsonData = await this.plugin.app.vault.adapter.read(backupPath);

      // Parse JSON
      const data = JSON.parse(jsonData) as SettingsData;

      return data;
    } catch (error) {
      throw new BackupError(
        `Failed to restore from backup: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Generate backup filename following convention
   *
   * @param fromVersion - Current version
   * @param toVersion - Target version
   * @returns Filename in format: data-backup-v{OLD}-to-v{NEW}-YYYYMMDD-HHMMSS.json
   *
   * @example
   * ```typescript
   * generateFilename(0, 1)
   * // Returns: "data-backup-v0-to-v1-20260209-143052.json"
   * ```
   */
  generateFilename(fromVersion: number, toVersion: number): string {
    const timestamp = generateTimestamp();
    return `data-backup-v${fromVersion}-to-v${toVersion}-${timestamp}.json`;
  }
}
