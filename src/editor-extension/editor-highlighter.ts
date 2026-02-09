import { RegExpCursor, SearchCursor } from '@codemirror/search';
import { RangeSetBuilder, type Text } from '@codemirror/state';
import { Decoration, type DecorationSet, EditorView, type PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { highlightMark } from 'src/editor-extension';
import { type KeywordStyle, type ResolvedKeyword, resolveKeyword } from 'src/shared';
import { settingsStore } from 'src/stores/settings-store';
import { get } from 'svelte/store';

type NewDecoration = { from: number; to: number; decoration: Decoration };

function* findEditorMatches(doc: Text, resolved: ResolvedKeyword, caseSensitive: boolean): Generator<{ from: number; to: number }> {
  if (resolved.type === 'regex') {
    const cursor = new RegExpCursor(doc, resolved.pattern);
    cursor.next();
    while (!cursor.done) {
      yield { from: cursor.value.from, to: cursor.value.to };
      cursor.next();
    }
  } else {
    const cursor = caseSensitive
      ? new SearchCursor(doc, resolved.text)
      : new SearchCursor(doc, resolved.text, 0, doc.length, (s: string) => s.toLowerCase());
    cursor.next();
    while (!cursor.done) {
      yield { from: cursor.value.from, to: cursor.value.to };
      cursor.next();
    }
  }
}

export class EditorHighlighter implements PluginValue {
  decorations: DecorationSet;
  unsubscribe: () => void;

  constructor(view: EditorView) {
    this.decorations = this.buildDecorations(view);
    this.unsubscribe = settingsStore.subscribe(() => {
      setTimeout(() => {
        try {
          if (view.state) {
            this.decorations = this.buildDecorations(view);
            view.requestMeasure();
          }
        } catch {
          this.unsubscribe();
        }
      }, 0);
    });
  }

  update(update: ViewUpdate): void {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    }
  }

  destroy(): void {
    this.unsubscribe();
  }

  buildDecorations(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    const newDecorations: NewDecoration[] = [];

    const settings = get(settingsStore);
    const caseSensitive = settings.globalSettings.caseSensitive;

    settings.keywords
      .filter((keyword) => !!keyword.keyword)
      .forEach((k) => newDecorations.push(...this.buildDecorationsForKeyword(view, k, caseSensitive)));
    newDecorations.sort((a, b) => a.from - b.from);
    newDecorations.forEach((d) => builder.add(d.from, d.to, d.decoration));

    return builder.finish();
  }

  buildDecorationsForKeyword(view: EditorView, keyword: KeywordStyle, caseSensitive: boolean): NewDecoration[] {
    const resolved = resolveKeyword(keyword.keyword, caseSensitive);
    if (!resolved) return [];

    return Array.from(findEditorMatches(view.state.doc, resolved, caseSensitive), ({ from, to }) => ({
      from,
      to,
      decoration: highlightMark(keyword),
    }));
  }
}

export const editorHighlighter = ViewPlugin.fromClass(EditorHighlighter, {
  decorations: (value: EditorHighlighter) => value.decorations,
});
