import pc from 'picocolors';

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

const HEX_COLOR_PATTERN = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

function hexToRgb(hex: string): RgbColor | null {
  const hexColorMatch = HEX_COLOR_PATTERN.exec(hex);

  if (!hexColorMatch) {
    return null;
  }

  const redHex = hexColorMatch[1];
  const greenHex = hexColorMatch[2];
  const blueHex = hexColorMatch[3];

  return {
    r: parseInt(redHex, 16),
    g: parseInt(greenHex, 16),
    b: parseInt(blueHex, 16),
  };
}

function rgbToAnsi256(red: number, green: number, blue: number): number {
  const isGrayscale = red === green && green === blue;

  if (isGrayscale) {
    const GRAYSCALE_MIN = 8;
    const GRAYSCALE_MAX = 248;
    const GRAYSCALE_RANGE = 24;

    if (red < GRAYSCALE_MIN) return 16;
    if (red > GRAYSCALE_MAX) return 231;

    const grayscaleOffset = Math.round(((red - GRAYSCALE_MIN) / 247) * GRAYSCALE_RANGE);
    return grayscaleOffset + 232;
  }

  const ANSI_BASE = 16;
  const COLOR_LEVELS = 5;

  const redLevel = Math.round((red / 255) * COLOR_LEVELS);
  const greenLevel = Math.round((green / 255) * COLOR_LEVELS);
  const blueLevel = Math.round((blue / 255) * COLOR_LEVELS);

  return ANSI_BASE + (36 * redLevel) + (6 * greenLevel) + blueLevel;
}

export function colorize(text: string, hexColor?: string): string {
  if (!hexColor) {
    return text;
  }

  const rgbColor = hexToRgb(hexColor);

  if (!rgbColor) {
    return text;
  }

  const ansiColorCode = rgbToAnsi256(rgbColor.r, rgbColor.g, rgbColor.b);
  const ANSI_COLOR_PREFIX = '\x1b[38;5;';
  const ANSI_RESET = '\x1b[0m';

  return `${ANSI_COLOR_PREFIX}${ansiColorCode}m${text}${ANSI_RESET}`;
}

export function badge(text: string, hexColor?: string): string {
  if (!hexColor) {
    return pc.gray(`[${text}]`);
  }

  const rgbColor = hexToRgb(hexColor);

  if (!rgbColor) {
    return `[${text}]`;
  }

  const ansiColorCode = rgbToAnsi256(rgbColor.r, rgbColor.g, rgbColor.b);
  const ANSI_COLOR_PREFIX = '\x1b[38;5;';
  const ANSI_RESET = '\x1b[0m';
  const BADGE_SYMBOL = '●';

  return `${ANSI_COLOR_PREFIX}${ansiColorCode}m${BADGE_SYMBOL}${ANSI_RESET} ${text}`;
}

export function getStateColor(state: string): string {
  const colors: Record<string, string> = {
    OPEN: '#2da44e',
    MERGED: '#8250df',
    DECLINED: '#cf222e',
    SUPERSEDED: '#94a3b8',
  };
  return colors[state] || '#94a3b8';
}
