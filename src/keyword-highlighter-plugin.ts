import { Plugin } from "obsidian";
import { editorHighlighter } from "src/editor-extension";
import { SettingTab } from "src/settings/setting-tab";
import { readerHighlighter } from "./reader-extension";
import { createCommand } from "./commands";
import { initStore, saveStore } from "./stores/settings-store";

export class KeywordHighlighterPlugin extends Plugin {
  async onload(): Promise<void> {
    initStore(this);

    this.registerEditorExtension(editorHighlighter);
    this.registerMarkdownPostProcessor(readerHighlighter);

    this.addCommand(createCommand(this.app));

    this.addSettingTab(new SettingTab(this.app, this));
  }

  async saveSettings(): Promise<void> {
    await saveStore();
  }
}
