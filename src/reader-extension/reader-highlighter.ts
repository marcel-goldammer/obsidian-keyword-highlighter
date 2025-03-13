import type { MarkdownPostProcessor } from 'obsidian';
import { type KeywordStyle, getCssClasses } from 'src/shared';
import { settingsStore } from 'src/stores/settings-store';
import { get } from 'svelte/store';

export const readerHighlighter: MarkdownPostProcessor = (el: HTMLElement) => {
  const settings = get(settingsStore);
  const caseSensitive = settings.generalSettings?.caseSensitive ?? true;
  settings.keywords
    .filter((keyword) => !!keyword.keyword)
    .forEach((keyword) => replaceWithHighlight(el, keyword, caseSensitive));
};

function replaceWithHighlight(node: Node, keyword: KeywordStyle, caseSensitive: boolean) {
  if (
    // skip highlighting nodes
    node.nodeType === Node.ELEMENT_NODE &&
    (<Element>node).classList.contains('kh-highlighted')
  ) {
    return;
  } else if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
    const searchText = `${keyword.keyword}`;

    // handle case sensitive search
    let index = -1;
    if (caseSensitive) {
      index = node.nodeValue.indexOf(searchText);
    } else {
      index = node.nodeValue.toLowerCase().indexOf(searchText.toLowerCase());
    }

    if (index > -1) {
      // parent cannot be null
      const parent = node.parentNode!;
      const beforeText = node.nodeValue.substring(0, index);
      const matchedLength = searchText.length;
      const actualMatch = node.nodeValue.substring(index, index + matchedLength);
      const afterText = node.nodeValue.substring(index + matchedLength);
      // insert order: <beforeText> <highlight> <afterText>
      parent.insertBefore(document.createTextNode(beforeText), node);
      parent.insertBefore(getHighlightNode(parent, actualMatch, keyword), node);
      node.nodeValue = afterText;
      // we have to call the function again for all sibling nodes
      // to find all keyword occurances
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
