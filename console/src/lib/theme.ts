import type { ColorTheme, Subject } from '../types';

/**
 * A course or subject's colour lives in the data, the palette lives in CSS.
 * Each `tone-*` class sets --tone / --tone-soft / --tone-fg for both themes,
 * read by the tone-solid, tone-soft, tone-text and tone-bar utilities.
 */
const TONE_CLASS: Record<ColorTheme, string> = {
  red: 'tone-red',
  blue: 'tone-blue',
  amber: 'tone-amber',
  green: 'tone-green',
  violet: 'tone-violet',
};

/** Swatch colours for the course colour picker. */
export const TONE_SWATCH: Record<ColorTheme, string> = {
  red: '#eb5757',
  blue: '#2d9cdb',
  amber: '#f5a623',
  green: '#27ae60',
  violet: '#9b51e0',
};

/** Literal values, for SVG charts and swatches where a class cannot reach. */
export const TONE_HEX: Record<ColorTheme, string> = {
  red: '#eb5757',
  blue: '#2d9cdb',
  amber: '#f5a623',
  green: '#27ae60',
  violet: '#9b51e0',
};

export const SUBJECT_TONE: Record<Subject, ColorTheme> = {
  Maths: 'red',
  Physics: 'blue',
  Chemistry: 'amber',
  English: 'green',
};

/** Chart colours shared by the results and analytics screens. */
export const CHART = {
  correct: '#27ae60',
  incorrect: '#eb5757',
  skipped: '#f5a623',
  brand: '#c8102e',
  neutral: '#9aa0b8',
};

export function toneOf(theme: string | undefined): string {
  // Legacy course themes (orange/purple/pink) still resolve via their own classes.
  if (theme === 'orange') return 'tone-orange';
  if (theme === 'purple') return 'tone-purple';
  if (theme === 'pink') return 'tone-pink';
  return TONE_CLASS[(theme as ColorTheme) ?? 'red'] ?? TONE_CLASS.red;
}

export function toneOfSubject(subject: Subject): string {
  return TONE_CLASS[SUBJECT_TONE[subject]];
}

export function hexOfSubject(subject: Subject): string {
  return TONE_HEX[SUBJECT_TONE[subject]];
}
