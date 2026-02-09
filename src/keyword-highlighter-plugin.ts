import { Plugin } from 'obsidian';
import { editorHighlighter } from 'src/editor-extension';
import { SettingTab } from 'src/settings/setting-tab';
import { readerHighlighter } from './reader-extension';
import { createCommand } from './commands';
import { initStore, saveStore } from './stores/settings-store';
import { MigrationManager } from './migrations/migration-manager';
import { Migration001 } from './migrations/scripts/migration-001';
import { MIGRATION_CONFIG } from './migrations/types';

export class KeywordHighlighterPlugin extends Plugin {
  async onload(): Promise<void> {
    // Run migrations before initializing store
    await this.runMigrations();

    initStore(this);

    this.registerEditorExtension(editorHighlighter);
    this.registerMarkdownPostProcessor(readerHighlighter);

    this.addCommand(createCommand(this.app));

    this.addSettingTab(new SettingTab(this.app, this));
  }

  async saveSettings(): Promise<void> {
    await saveStore();
  }

  /**
   * Run data.json migration system
   *
   * Executes before settings initialization to ensure data structure is current
   */
  private async runMigrations(): Promise<void> {
    const manager = new MigrationManager(this, MIGRATION_CONFIG.CURRENT_VERSION);

    // Register all migration scripts
    manager.register(new Migration001());

    // Execute migrations
    const result = await manager.migrate();

    // Log result
    if (result.success) {
      if (result.migrationsApplied > 0) {
        console.log(`[Keyword Highlighter] Migration complete: v${result.fromVersion} → v${result.toVersion}`);
        console.log(`[Keyword Highlighter] Applied ${result.migrationsApplied} migration(s) in ${result.durationMs}ms`);
        if (result.backupPath) {
          console.log(`[Keyword Highlighter] Backup created: ${result.backupPath}`);
        }
      } else if (result.fromVersion === result.toVersion) {
        console.log(`[Keyword Highlighter] Settings already at current version (v${result.toVersion})`);
      }
    } else {
      console.error(`[Keyword Highlighter] Migration failed: v${result.fromVersion} → v${result.toVersion}`);
      console.error(`[Keyword Highlighter] Error:`, result.error);
      if (result.backupPath) {
        console.error(`[Keyword Highlighter] Backup available at: ${result.backupPath}`);
      }
    }

    // Log performance warning if migration took too long
    if (result.durationMs > 1000) {
      console.warn(`[Keyword Highlighter] Migration took ${result.durationMs}ms (>1000ms threshold)`);
    }
  }
}
