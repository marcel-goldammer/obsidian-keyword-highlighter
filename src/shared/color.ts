export class Color {
  r: number;
  g: number;
  b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  static fromHex(hex: string): Color {
    const hexPattern = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!hexPattern) {
      console.warn('input is not a hex string');
      return new Color(0, 0, 0);
    }

    return new Color(parseInt(hexPattern[1], 16), parseInt(hexPattern[2], 16), parseInt(hexPattern[3], 16));
  }

  static fromHsl(h: number, s: number, l: number): Color {
    const normalizedS = s / 100;
    const normalizedL = l / 100;
    const hueShift = (n: number) => (n + h / 30) % 12;
    const chroma = normalizedS * Math.min(normalizedL, 1 - normalizedL);
    const colorComponent = (n: number) =>
      normalizedL - chroma * Math.max(-1, Math.min(hueShift(n) - 3, 9 - hueShift(n), 1));
    return new Color(
      Math.round(255 * colorComponent(0)),
      Math.round(255 * colorComponent(8)),
      Math.round(255 * colorComponent(4)),
    );
  }

  static fromHslString(hslString: string): Color {
    const hslRegex = /hsl\(\s*(\d+),\s*(\d+)%,\s*(\d+)%\)/i;
    const match = hslString.match(hslRegex);
    if (!match) {
      console.warn('input is not a hsl string');
      return new Color(0, 0, 0);
    }

    const h = parseFloat(match[1]);
    const s = parseFloat(match[2]);
    const l = parseFloat(match[3]);

    return this.fromHsl(h, s, l);
  }

  static fromRgbString(rgbString: string): Color {
    const rgbRegex = /rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\)/i;
    const match = rgbString.match(rgbRegex);
    if (!match) {
      console.warn('input is not a rgb string');
      return new Color(0, 0, 0);
    }

    const red = parseInt(match[1], 10);
    const green = parseInt(match[2], 10);
    const blue = parseInt(match[3], 10);

    return new Color(red, green, blue);
  }

  toHex(): string {
    return '#' + ((1 << 24) + (this.r << 16) + (this.g << 8) + this.b).toString(16).slice(1);
  }

  toHsl(): [number, number, number] {
    const r = this.r / 255,
      g = this.g / 255,
      b = this.b / 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
        default:
          h = 0;
      }
      h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  toHslString(): string {
    const hsl = this.toHsl();
    return `hsl(${hsl[0]}, ${hsl[1]}, ${hsl[2]})`;
  }
}
