import type { ColorTheme } from '../types';

interface ThemeTokens {
  /** Solid background for emoji badges and covers. */
  bg: string;
  /** Softer tinted background for chips. */
  soft: string;
  text: string;
  border: string;
  hex: string;
}

export const THEME: Record<ColorTheme, ThemeTokens> = {
  green: { bg: 'bg-grass', soft: 'bg-grass/15', text: 'text-grass-dark', border: 'border-grass-dark', hex: '#58CC02' },
  blue: { bg: 'bg-macaw', soft: 'bg-macaw/15', text: 'text-macaw-dark', border: 'border-macaw-dark', hex: '#1CB0F6' },
  orange: { bg: 'bg-fox', soft: 'bg-fox/15', text: 'text-fox-dark', border: 'border-fox-dark', hex: '#FF9600' },
  purple: { bg: 'bg-beetle', soft: 'bg-beetle/15', text: 'text-beetle-dark', border: 'border-beetle-dark', hex: '#CE82FF' },
  pink: { bg: 'bg-flamingo', soft: 'bg-flamingo/15', text: 'text-flamingo-dark', border: 'border-flamingo-dark', hex: '#FF86D0' },
};

export function themeOf(theme: string | undefined): ThemeTokens {
  return THEME[(theme as ColorTheme) ?? 'green'] ?? THEME.green;
}
