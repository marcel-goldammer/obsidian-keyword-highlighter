/**
 * Migration System API Contracts
 *
 * This file defines TypeScript interfaces for the migration system.
 * These contracts serve as the specification for implementation.
 *
 * @version 1.0.0
 * @date 2026-02-09
 */

// ============================================================================
// Core Data Structures
// ============================================================================

/**
 * Root settings data structure stored in data.json
 *
 * @property settingsVersion - Schema version number (missing = version 0)
 * @property globalSettings - Global plugin settings (added in v1)
 * @property keywords - User-defined keyword configurations (existing structure)
 */
export interface SettingsData {
  settingsVersion?: number;
  globalSettings?: GlobalSettings;
  keywords: KeywordConfig[];
  [key: string]: unknown; // Allow other plugin settings
}

/**
 * Global plugin settings (added in version 1)
 */
export interface GlobalSettings {
  caseSensitive: boolean;
}

/**
 * Individual keyword configuration (existing structure - not modified by this feature)
 */
export interface KeywordConfig {
  keyword: string;
  fontColor: string;
  backgroundColor: string;
  // ... other existing fields
}

// ============================================================================
// Migration Script Contract (Strategy Pattern)
// ============================================================================

/**
 * Interface for migration scripts implementing strategy pattern.
 * Each migration transforms data from version N-1 to version N.
 *
 * Requirements:
 * - Must be idempotent (safe to run multiple times)
 * - Must not mutate input data (return new object)
 * - Must set settingsVersion to match version property
 */
export interface MigrationScript {
  /**
   * Target version this migration produces
   * @example migration-001.ts has version = 1
   */
  readonly version: number;

  /**
   * Human-readable migration name for logging
   * @example "Add settingsVersion field"
   */
  readonly name?: string;

  /**
   * Transform data from version N-1 to version N
   *
   * @param data - Input data at version N-1
   * @returns Promise resolving to data at version N
   * @throws Error if migration cannot be completed
   */
  execute(data: SettingsData): Promise<SettingsData>;

  /**
   * Validate that data matches expected structure for this version
   *
   * @param data - Data to validate
   * @returns true if data is valid for this version, false otherwise
   */
  validate(data: SettingsData): boolean;
}

// ============================================================================
// Migration Results
// ============================================================================

/**
 * Result object returned by migration operations
 */
export interface MigrationResult {
  /** Whether migration completed successfully */
  success: boolean;

  /** Starting settingsVersion */
  fromVersion: number;

  /** Target settingsVersion (achieved if success=true) */
  toVersion: number;

  /** Number of migration scripts executed */
  migrationsApplied: number;

  /** Path to backup file created (null if no backup needed) */
  backupPath: string | null;

  /** Error object if failure occurred */
  error: Error | null;

  /** Time taken for migration process (milliseconds) */
  durationMs: number;
}

// ============================================================================
// Migration Manager Contract
// ============================================================================

/**
 * Central orchestrator for migration process
 *
 * Responsibilities:
 * - Registers migration scripts
 * - Detects version mismatches
 * - Creates backups before migration
 * - Executes migrations sequentially
 * - Handles rollback on failure
 */
export interface IMigrationManager {
  /**
   * Current plugin version (target for migrations)
   */
  readonly currentPluginVersion: number;

  /**
   * Register a migration script
   *
   * @param migration - Migration script to register
   * @throws Error if version already registered
   */
  register(migration: MigrationScript): void;

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
  migrate(): Promise<MigrationResult>;
}

// ============================================================================
// Backup Manager Contract
// ============================================================================

/**
 * Handles backup file operations
 *
 * Naming convention: data-backup-v{OLD}-to-v{NEW}-YYYYMMDD-HHMMSS.json
 * Storage location: .obsidian/plugins/keyword-highlighter/
 */
export interface IBackupManager {
  /**
   * Create backup file before migration
   *
   * @param data - Current settings data to backup
   * @param fromVersion - Current settingsVersion
   * @param toVersion - Target settingsVersion
   * @returns Promise resolving to backup file path
   * @throws Error if backup creation fails
   */
  createBackup(data: SettingsData, fromVersion: number, toVersion: number): Promise<string>;

  /**
   * Restore data.json from backup file
   *
   * @param backupPath - Path to backup file
   * @returns Promise resolving to restored data
   * @throws Error if restore fails (file not found, invalid JSON)
   */
  restore(backupPath: string): Promise<SettingsData>;

  /**
   * Generate backup filename following convention
   *
   * @param fromVersion - Current version
   * @param toVersion - Target version
   * @returns Filename in format: data-backup-v{OLD}-to-v{NEW}-YYYYMMDD-HHMMSS.json
   */
  generateFilename(fromVersion: number, toVersion: number): string;
}

// ============================================================================
// Data Validator Contract
// ============================================================================

/**
 * Validates data.json structure before and after migrations
 */
export interface IDataValidator {
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
  validateStructure(data: unknown): boolean;

  /**
   * Validate data matches expected structure for specific version
   *
   * Delegates to migration script's validate() method
   *
   * @param data - Data to validate
   * @param version - Expected settingsVersion
   * @returns true if data valid for version, false otherwise
   */
  validateForVersion(data: SettingsData, version: number): boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Backup file metadata (encoded in filename)
 */
export interface BackupMetadata {
  oldVersion: number;
  newVersion: number;
  timestamp: string; // YYYYMMDD-HHMMSS format
  filename: string;
}

/**
 * Migration execution context passed to migration scripts
 */
export interface MigrationContext {
  /** Obsidian plugin instance */
  plugin: unknown; // Actual type: Plugin from 'obsidian'

  /** Logger function for migration progress */
  log: (message: string) => void;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Custom error for migration failures
 */
export class MigrationError extends Error {
  constructor(
    message: string,
    public readonly fromVersion: number,
    public readonly toVersion: number,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'MigrationError';
  }
}

/**
 * Custom error for validation failures
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly version: number,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Custom error for backup operations
 */
export class BackupError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'BackupError';
  }
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Migration system configuration constants
 */
export const MIGRATION_CONFIG = {
  /** Current plugin settingsVersion (increment when data structure changes) */
  CURRENT_VERSION: 1,

  /** Default version for legacy data (missing settingsVersion field) */
  LEGACY_VERSION: 0,

  /** Backup filename prefix */
  BACKUP_PREFIX: 'data-backup-',

  /** Maximum time for single migration (milliseconds) */
  MIGRATION_TIMEOUT_MS: 5000,

  /** Log level for migration operations */
  LOG_LEVEL: 'info' as 'debug' | 'info' | 'warn' | 'error',
} as const;
