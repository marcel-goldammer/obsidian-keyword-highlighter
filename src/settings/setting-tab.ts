import KeywordHighlighterPlugin from 'main';
import { App, PluginSettingTab } from 'obsidian';
import SettingTabComponent from './SettingTab.svelte';
import { saveStore, settingsStore } from 'src/stores/settings-store';

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
        settingsStore,
      },
    });
  }

  async hide(): Promise<void> {
    await saveStore();
  }
}
