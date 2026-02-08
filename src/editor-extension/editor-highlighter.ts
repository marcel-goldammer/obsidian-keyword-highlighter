import { RegExpCursor, SearchCursor } from '@codemirror/search';
import { RangeSetBuilder } from '@codemirror/state';
import { Decoration, type DecorationSet, EditorView, type PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { highlightMark } from 'src/editor-extension';
import { type KeywordStyle, resolveKeyword } from 'src/shared';
import { settingsStore } from 'src/stores/settings-store';
import { get } from 'svelte/store';

type NewDecoration = { from: number; to: number; decoration: Decoration };

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
    const newDecorations: NewDecoration[] = [];

    const resolved = resolveKeyword(keyword.keyword, caseSensitive);
    if (!resolved) {
      return newDecorations;
    }

    if (resolved.type === 'regex') {
      const cursor = new RegExpCursor(view.state.doc, resolved.pattern);
      cursor.next();
      while (!cursor.done) {
        newDecorations.push({
          from: cursor.value.from,
          to: cursor.value.to,
          decoration: highlightMark(keyword),
        });
        cursor.next();
      }
    } else {
      const cursor = caseSensitive
        ? new SearchCursor(view.state.doc, resolved.text)
        : new SearchCursor(view.state.doc, resolved.text, 0, view.state.doc.length, (s: string) => s.toLowerCase());
      cursor.next();
      while (!cursor.done) {
        newDecorations.push({
          from: cursor.value.from,
          to: cursor.value.to,
          decoration: highlightMark(keyword),
        });
        cursor.next();
      }
    }

    return newDecorations;
  }
}

export const editorHighlighter = ViewPlugin.fromClass(EditorHighlighter, {
  decorations: (value: EditorHighlighter) => value.decorations,
});
