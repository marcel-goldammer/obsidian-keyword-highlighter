import { Decoration } from "@codemirror/view";
import { type KeywordStyle, getCssClasses } from "src/shared";

export const highlightMark = (keyword: KeywordStyle) => {
  const styles = [];
  const showColor = keyword.showColor ?? true;
  if (showColor) {
    styles.push(`--kh-c: ${keyword.color}`);
  }
  const showBackgroundColor = keyword.showBackgroundColor ?? true;
  if (showBackgroundColor) {
    styles.push(`--kh-bgc: ${keyword.backgroundColor}`);
  }

  return Decoration.mark({
    class: getCssClasses(keyword),
    attributes: {
      style: styles.join(";"),
    },
  });
};
