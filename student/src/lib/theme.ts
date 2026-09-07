import type { ColorTheme } from '../types';

/**
 * A course's colour lives in the data, but the palette lives in CSS. Each
 * `tone-*` class sets --tone / --tone-soft / --tone-fg for both themes, and the
 * `tone-solid`, `tone-soft`, `tone-text` and `tone-bar` utilities read them.
 */
const TONE_CLASS: Record<ColorTheme, string> = {
  green: 'tone-green',
  blue: 'tone-blue',
  orange: 'tone-orange',
  purple: 'tone-purple',
  pink: 'tone-pink',
};

/** Swatch colours for the picker, where a literal value is unavoidable. */
export const TONE_SWATCH: Record<ColorTheme, string> = {
  green: '#10b981',
  blue: '#3b82f6',
  orange: '#f59e0b',
  purple: '#8b5cf6',
  pink: '#ec4899',
};

export function toneOf(theme: string | undefined): string {
  return TONE_CLASS[(theme as ColorTheme) ?? 'green'] ?? TONE_CLASS.green;
}
