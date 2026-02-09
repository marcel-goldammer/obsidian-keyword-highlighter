import type { MarkdownPostProcessor } from 'obsidian';
import { type KeywordStyle, getCssClasses, resolveKeyword, findTextMatch } from 'src/shared';
import { settingsStore } from 'src/stores/settings-store';
import { get } from 'svelte/store';

export const readerHighlighter: MarkdownPostProcessor = (el: HTMLElement) => {
  const settings = get(settingsStore);
  const caseSensitive = settings.globalSettings.caseSensitive;
  settings.keywords.filter((keyword) => !!keyword.keyword).forEach((keyword) => replaceWithHighlight(el, keyword, caseSensitive));
};

function replaceWithHighlight(node: Node, keyword: KeywordStyle, caseSensitive: boolean) {
  if (
    // skip highlighting nodes
    node.nodeType === Node.ELEMENT_NODE &&
    (<Element>node).classList.contains('kh-highlighted')
  ) {
    return;
  } else if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
    const resolved = resolveKeyword(keyword.keyword, caseSensitive);
    if (!resolved) return;

    const match = findTextMatch(node.nodeValue, resolved, caseSensitive);
    if (match) {
      // parent cannot be null
      const parent = node.parentNode!;
      const beforeText = node.nodeValue.substring(0, match.index);
      const afterText = node.nodeValue.substring(match.index + match.matchedText.length);
      const highlight = getHighlightNode(parent, match.matchedText, keyword);
      // insert order: <beforeText> <highlight> <afterText>
      parent.insertBefore(document.createTextNode(beforeText), node);
      parent.insertBefore(highlight, node);
      node.nodeValue = afterText;
      // recurse on parent's children to find more matches
      parent.childNodes.forEach((child) => replaceWithHighlight(child, keyword, caseSensitive));
    }

    return;
  }
  // call recursively
  node.childNodes.forEach((child) => replaceWithHighlight(child, keyword, caseSensitive));
}

function getHighlightNode(parent: Node, searchText: string, keyword: KeywordStyle): Node {
  const highlight = parent.createSpan();
  highlight.classList.add(...getCssClasses(keyword).split(' '));
  const showColor = keyword.showColor ?? true;
  if (showColor) {
    highlight.style.setProperty('--kh-c', keyword.color);
  }
  const showBackgroundColor = keyword.showBackgroundColor ?? true;
  if (showBackgroundColor) {
    highlight.style.setProperty('--kh-bgc', keyword.backgroundColor);
  }
  highlight.setText(searchText);
  return highlight;
}
