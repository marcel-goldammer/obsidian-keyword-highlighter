import KeywordHighlighterPlugin from "main";
import { MarkdownPostProcessor } from "obsidian";
import { KeywordStyle, getCssClasses } from "src/shared";

export const readerHighlighter: MarkdownPostProcessor = (el: HTMLElement) => {
  KeywordHighlighterPlugin.settings.keywords
    .filter((keyword) => !!keyword.keyword)
    .forEach((keyword) => replaceWithHighlight(el, keyword));
};

function replaceWithHighlight(node: Node, keyword: KeywordStyle) {
  if (
    // skip highlighting nodes
    node.nodeType === Node.ELEMENT_NODE &&
    (<Element>node).classList.contains("kh-highlighted")
  ) {
    return;
  } else if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
    const searchText = `${keyword.keyword}`;
    const index = node.nodeValue.indexOf(searchText);
    if (index > -1) {
      // parent cannot be null
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const parent = node.parentNode!;
      const beforeText = node.nodeValue.substring(0, index);
      const afterText = node.nodeValue.substring(index + searchText.length);
      const highlight = getHighlightNode(parent, searchText, keyword);
      // insert order: <beforeText> <highlight> <afterText>
      parent.insertBefore(document.createTextNode(beforeText), node);
      parent.insertBefore(highlight, node);
      node.nodeValue = afterText;
      // we have to call the function again for all sibling nodes
      // to find all keyword occurances
      parent.childNodes.forEach((child) =>
        replaceWithHighlight(child, keyword)
      );
    }

    return;
  }
  // call recursively
  node.childNodes.forEach((child) => replaceWithHighlight(child, keyword));
}

function getHighlightNode(
  parent: Node,
  searchText: string,
  keyword: KeywordStyle
): Node {
  const highlight = parent.createSpan();
  highlight.classList.add(...getCssClasses(keyword).split(" "));
  const showColor = keyword.showColor ?? true;
  if (showColor) {
    highlight.style.setProperty("--kh-c", keyword.color);
  }
  const showBackgroundColor = keyword.showBackgroundColor ?? true;
  if (showBackgroundColor) {
    highlight.style.setProperty("--kh-bgc", keyword.backgroundColor);
  }
  highlight.setText(searchText);
  return highlight;
}
