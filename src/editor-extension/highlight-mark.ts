import { Decoration } from "@codemirror/view";
import { KeywordStyle } from "src/editor-extension";

export const highlightMark = (keyword: KeywordStyle) =>
  Decoration.mark({
    class: "kh-highlighted",
    attributes: {
      style: `--kh-c: ${keyword.color}; --kh-bgc: ${keyword.backgroundColor}`,
    },
  });
