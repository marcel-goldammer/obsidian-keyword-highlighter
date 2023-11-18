import KeywordHighlighterPlugin from "main";
import { MarkdownPostProcessor } from "obsidian";

export const readerHighlighter: MarkdownPostProcessor = (el: HTMLElement) => {
  KeywordHighlighterPlugin.settings.keywords.forEach((keyword) => {
    const regex = new RegExp(`(${keyword.keyword}:)`, "gi");
    el.innerHTML = el.innerHTML.replace(
      regex,
      `<span class="kh-highlighted" style="--kh-c: ${keyword.color}; --kh-bgc: ${keyword.backgroundColor}">$1</span>`
    );
  });
};
