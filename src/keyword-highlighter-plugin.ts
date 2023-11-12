import { MarkdownView, Plugin } from "obsidian";
import { EditorView } from "@codemirror/view";
import { KeywordStyle, keywordHighlighter } from "src/editor-extension";
import { SettingTab } from "src/setting-tab";

interface PluginSettings {
  keywords: KeywordStyle[];
}

const DEFAULT_SETTINGS: PluginSettings = {
  keywords: [
    {
      keyword: "TODO",
      color: "#000",
      backgroundColor: "#A9CCE3",
    },
    {
      keyword: "ADD",
      color: "#000",
      backgroundColor: "#8DE3C2",
    },
    {
      keyword: "FIXME",
      color: "#000",
      backgroundColor: "#BAA2E8",
    },
  ],
};

export class KeywordHighlighterPlugin extends Plugin {
  static settings: PluginSettings;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.registerEditorExtension(keywordHighlighter);

    this.addSettingTab(new SettingTab(this.app, this));
  }

  async loadSettings(): Promise<void> {
    KeywordHighlighterPlugin.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
    this.refreshEditorView();
  }

  async saveSettings(): Promise<void> {
    await this.saveData(KeywordHighlighterPlugin.settings);
    this.refreshEditorView();
  }

  refreshEditorView(): void {
    const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    // @ts-expect-error, not typed
    const editorView = markdownView?.editor.cm as EditorView;
    if (editorView) {
      editorView.setState(editorView.state);
    }
  }
}
