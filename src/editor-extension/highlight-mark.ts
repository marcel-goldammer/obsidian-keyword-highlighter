import { Decoration } from "@codemirror/view";
import { KeywordStyle } from "src/shared";

const fontModifiers = new Map<string, string>([
  ["bold", "cm-strong"],
  ["italic", "cm-em"],
  ["underline", "kh-underline"],
  ["lineThrough", "kh-line-through"],
]);

function getCssClasses(keyword: KeywordStyle): string {
  const classes: string[] = ["kh-highlighted"];
  if (keyword.fontModifiers) {
    keyword.fontModifiers
      .map((v) => fontModifiers.get(v))
      .filter((v): v is string => v !== undefined)
      .forEach((v) => classes.push(v));
  }
  return classes.join(" ");
}

export const highlightMark = (keyword: KeywordStyle) =>
  Decoration.mark({
    class: getCssClasses(keyword),
    attributes: {
      style: `--kh-c: ${keyword.color}; --kh-bgc: ${keyword.backgroundColor}`,
    },
  });
