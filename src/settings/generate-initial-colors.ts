import { Color } from 'src/shared';

function generateBackgroundColor(): Color {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(60 + Math.random() * 10);
  const lightness = Math.floor(75 + Math.random() * 10);

  return Color.fromHsl(hue, saturation, lightness);
}

const colorBases = [
  '--color-base-00',
  '--color-base-05',
  '--color-base-10',
  '--color-base-20',
  '--color-base-25',
  '--color-base-30',
  '--color-base-35',
  '--color-base-40',
  '--color-base-50',
  '--color-base-60',
  '--color-base-70',
  '--color-base-100',
];

const colorFallback = '#000000';

function toColor(value: string): Color {
  if (value.startsWith('#')) {
    return Color.fromHex(value);
  } else if (value.startsWith('hsl')) {
    return Color.fromHslString(value);
  } else {
    return Color.fromRgbString(value);
  }
}

function luminance(color: Color): number {
  const normalizedValues = [color.r, color.g, color.b].map((colorComponent) => {
    const normalizedComponent = colorComponent / 255;
    return normalizedComponent <= 0.03928
      ? normalizedComponent / 12.92
      : Math.pow((normalizedComponent + 0.055) / 1.055, 2.4);
  });
  return normalizedValues[0] * 0.2126 + normalizedValues[1] * 0.7152 + normalizedValues[2] * 0.0722;
}

function contrastRatio(forgroundColor: Color, backgroundColor: Color): number {
  const lum1 = luminance(forgroundColor);
  const lum2 = luminance(backgroundColor);
  const higherLum = Math.max(lum1, lum2);
  const lowerLum = Math.min(lum1, lum2);
  return (higherLum + 0.05) / (lowerLum + 0.05);
}

function chooseForeground(backgroundColor: Color, container: HTMLElement): Color {
  return colorBases
    .map((c) => container.getCssPropertyValue(c))
    .map((c) => (c.length > 0 ? c : colorFallback))
    .map((c) => toColor(c))
    .map((c) => ({ c, l: contrastRatio(c, backgroundColor) }))
    .sort((a, b) => b.l - a.l)[0].c;
}

export function generateInitialColors(container: HTMLElement): [Color, Color] {
  const backgroundColor = generateBackgroundColor();
  const foregroundColor = chooseForeground(backgroundColor, container);
  return [foregroundColor, backgroundColor];
}
