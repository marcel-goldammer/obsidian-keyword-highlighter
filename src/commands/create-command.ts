/* eslint-disable @typescript-eslint/no-explicit-any */
import { App, type Command, MarkdownView } from 'obsidian';
import { addKeyword } from 'src/stores/settings-store';

const settingTabId = 'keyword-highlighter';

function openSettingsAndAddKeyword(app: App, value: string | undefined): void {
  const setting = (app as any).setting;
  setting.open();
  setting.openTabById(settingTabId);
  addKeyword(value);
}

export const createCommand: (app: App) => Command = (app: App) => ({
  id: 'kh-create-new-keyword',
  name: 'Add a new keyword',
  callback: () => {
    // cannot use editorCallback here, because it overrides callback and the command would be available in editor mode only
    let selection: string | undefined;
    const view = app.workspace.getActiveViewOfType(MarkdownView);
    if (view && view.getMode() === 'source') {
      selection = view.editor.getSelection().trim();
      if (selection.endsWith(':')) {
        selection = selection.slice(0, -1);
      }
    }
    openSettingsAndAddKeyword(app, selection);
  },
});
