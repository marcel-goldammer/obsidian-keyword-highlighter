import { fontModifiers } from './font-modifiers';
import type { KeywordStyle } from './keyword-style';

export function getCssClasses(keyword: KeywordStyle): string {
  const classes: string[] = ['kh-highlighted'];
  if (keyword.fontModifiers) {
    keyword.fontModifiers
      .map((v) => fontModifiers.get(v))
      .filter((v): v is string => v !== undefined)
      .forEach((v) => classes.push(v));
  }
  return classes.join(' ');
}
