import { App, MarkdownView } from 'obsidian';
import type { KeywordHighlighterPlugin } from 'src/keyword-highlighter-plugin';
import { generateInitialColors } from 'src/settings/generate-initial-colors';
import type { KeywordStyle } from 'src/shared';
import { get, writable } from 'svelte/store';

export interface PluginSettings {
  keywords: KeywordStyle[];
}

const DEFAULT_SETTINGS: PluginSettings = {
  keywords: [
    {
      keyword: 'TODO',
      color: '#000000',
      backgroundColor: '#A9CCE3',
      fontModifiers: [],
      showColor: true,
      showBackgroundColor: true,
    },
    {
      keyword: 'ADD',
      color: '#000000',
      backgroundColor: '#8DE3C2',
      fontModifiers: [],
      showColor: true,
      showBackgroundColor: true,
    },
    {
      keyword: 'FIXME',
      color: '#000000',
      backgroundColor: '#BAA2E8',
      fontModifiers: [],
      showColor: true,
      showBackgroundColor: true,
    },
  ],
};

export const settingsStore = writable<PluginSettings>(DEFAULT_SETTINGS);

let plugin: KeywordHighlighterPlugin | null = null;
let appInstance: App | null = null;

export function initStore(pluginInstance: KeywordHighlighterPlugin): void {
  plugin = pluginInstance;
  appInstance = plugin.app;
  loadStore();
}

export async function loadStore(): Promise<void> {
  if (!plugin) return;

  const loadedDate = await plugin.loadData();
  const settings = Object.assign({}, DEFAULT_SETTINGS, loadedDate);
  settingsStore.set(settings);
}

export async function saveStore(): Promise<void> {
  if (!plugin) return;

  const currentSettings = get(settingsStore);

  currentSettings.keywords = currentSettings.keywords.filter((k) => k.keyword && k.keyword.match(/^ *$/) === null);

  await plugin.saveData(currentSettings);
  refreshViews();
}

function refreshViews(): void {
  if (!appInstance) return;

  const markdownView = appInstance.workspace.getActiveViewOfType(MarkdownView);
  markdownView?.previewMode.rerender(true);

  // refresh editor mode
  // @ts-expect-error, not typed
  const editorView = markdownView?.editor.cm as EditorView;
  if (editorView) {
    editorView.setState(editorView.state);
  }
}

export function addKeyword(value?: string, container?: HTMLElement): void {
  if (!container) {
    container = document.body;
  }

  const [foregroundColor, backgroundColor] = generateInitialColors(container);
  settingsStore.update((settings) => {
    settings.keywords.push({
      keyword: value ?? '',
      color: foregroundColor.toHex(),
      backgroundColor: backgroundColor.toHex(),
      fontModifiers: [],
      showColor: true,
      showBackgroundColor: true,
    });
    return settings;
  });
}

export function removeKeyword(keyword: KeywordStyle): void {
  settingsStore.update((settings) => {
    const index = settings.keywords.indexOf(keyword);
    if (index > -1) {
      settings.keywords.splice(index, 1);
    }
    return settings;
  });
}
