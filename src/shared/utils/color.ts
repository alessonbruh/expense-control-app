const channels = (hex: string) =>
  [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));

export function relativeLuminance(hex: string): number {
  const [r, g, b] = channels(hex).map(value => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function readableTextColor(background: string): string {
  return relativeLuminance(background) < 0.2 ? '#ffffff' : '#0f172a';
}

export function mixColors(color: string, base: string, amount: number): string {
  const a = channels(color);
  const b = channels(base);
  const mixed = a.map((value, i) =>
    Math.round(value * amount + b[i]! * (1 - amount))
      .toString(16)
      .padStart(2, '0'),
  );
  return `#${mixed.join('')}`;
}
