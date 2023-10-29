import KeywordHighlighterPlugin from "main";
import { App, PluginSettingTab, Setting } from "obsidian";
import { KeywordStyle } from "./editor-extension";

export class SettingTab extends PluginSettingTab {
  plugin: KeywordHighlighterPlugin;

  constructor(app: App, plugin: KeywordHighlighterPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    const keywordContainer = containerEl.createDiv();

    KeywordHighlighterPlugin.settings.keywords.forEach((k, i) => {
      this.createKeywordSetting(k, i, keywordContainer);
    });

    new Setting(containerEl).addButton((button) =>
      button.setButtonText("Add new keyword").onClick(() => {
        KeywordHighlighterPlugin.settings.keywords.push({
          keyword: "",
          color: "",
          backgroundColor: "",
        });
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const newKeyword = KeywordHighlighterPlugin.settings.keywords.last()!;
        this.createKeywordSetting(
          newKeyword,
          KeywordHighlighterPlugin.settings.keywords.length - 1,
          keywordContainer
        );
      })
    );
  }

  private createKeywordSetting(
    keyword: KeywordStyle,
    index: number,
    container: HTMLElement
  ): void {
    new Setting(container)
      .setName(`Keyword #${index}`)
      .setDesc(
        "Enter a keyword to highlight, a font color and a background color)"
      )
      .addText((text) =>
        text.setValue(keyword.keyword).onChange(async (value) => {
          keyword.keyword = value;
        })
      )
      .addColorPicker((cp) =>
        cp.setValue(keyword.color).onChange(async (value) => {
          keyword.color = value;
        })
      )
      .addColorPicker((cp) =>
        cp.setValue(keyword.backgroundColor).onChange(async (value) => {
          keyword.backgroundColor = value;
        })
      )
      .addExtraButton((button) =>
        button
          .setIcon("minus-with-circle")
          .setTooltip("Remove keyword")
          .onClick(async () => {
            // remove the keyword from settings
            const i =
              KeywordHighlighterPlugin.settings.keywords.indexOf(keyword);
            if (i > -1) {
              KeywordHighlighterPlugin.settings.keywords.splice(i, 1);
              const settingEl =
                container.getElementsByClassName("setting-item")[i];
              container.removeChild(settingEl);
            }
          })
      );
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
