import { Command, Editor, MarkdownView } from "obsidian";
import { SettingTab } from "src/settings/setting-tab";

const settingTabId = "keyword-highlighter";

export const createCommand: Command = {
  id: "create-new-keyword",
  name: "Add a new keyword",
  editorCallback: (editor: Editor, ctx: MarkdownView) => {
    const setting = (ctx.app as any).setting;
    setting.open();
    setting.openTabById(settingTabId);

    const settingTab: SettingTab = setting.pluginTabs.find(
      (tab: any) => tab.id === settingTabId
    );

    const keywordContainer = settingTab.containerEl
      .firstElementChild as HTMLElement;
    let selection = editor.getSelection().trim();
    if (selection.endsWith(":")) {
      selection = selection.slice(0, -1);
    }
    settingTab.addKeywordSetting(keywordContainer, selection);
  },
};
