import KeywordHighlighterPlugin from "main";
import { App, PluginSettingTab } from "obsidian";
import { type KeywordStyle } from "src/shared";
import { generateInitialColors } from "./generate-initial-colors";
import SettingTabComponent from "./SettingTab.svelte";

export class SettingTab extends PluginSettingTab {
  plugin: KeywordHighlighterPlugin;
  component?: SettingTabComponent;

  constructor(app: App, plugin: KeywordHighlighterPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    this.component = new SettingTabComponent({
      target: containerEl,
      props: {
        keywords: KeywordHighlighterPlugin.settings.keywords,
      },
    });
    this.component.$on("addKeyword", () =>
      this.#addKeywordSetting(containerEl)
    );
    this.component.$on("removeKeyword", (event) =>
      this.#removeKeywordSetting(event.detail.keyword)
    );
    this.component.$on("update", () => this.#updateComponent());
  }

  #addKeywordSetting(container: HTMLElement, value?: string): void {
    const [foregroundColor, backgroundColor] = generateInitialColors(container);
    KeywordHighlighterPlugin.settings.keywords.push({
      keyword: value ?? "",
      color: foregroundColor.toHex(),
      backgroundColor: backgroundColor.toHex(),
      fontModifiers: [],
      showColor: true,
      showBackgroundColor: true,
    });
    this.#updateComponent();
  }

  #removeKeywordSetting(keyword: KeywordStyle): void {
    // remove the keyword from settings
    const i = KeywordHighlighterPlugin.settings.keywords.indexOf(keyword);
    if (i > -1) {
      KeywordHighlighterPlugin.settings.keywords.splice(i, 1);
      this.#updateComponent();
    }
  }

  #updateComponent(): void {
    // we need to refresh the keywords input to update the component
    this.component?.$set({
      keywords: KeywordHighlighterPlugin.settings.keywords,
    });
  }

  async hide(): Promise<void> {
    // remove empty keywords
    KeywordHighlighterPlugin.settings.keywords =
      KeywordHighlighterPlugin.settings.keywords.filter(
        (k) => k.keyword && k.keyword.match(/^ *$/) === null
      );
    await this.plugin.saveSettings();
  }
}
