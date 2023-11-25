import { Decoration } from "@codemirror/view";
import { KeywordStyle, getCssClasses } from "src/shared";

export const highlightMark = (keyword: KeywordStyle) =>
  Decoration.mark({
    class: getCssClasses(keyword),
    attributes: {
      style: `--kh-c: ${keyword.color}; --kh-bgc: ${keyword.backgroundColor}`,
    },
  });
