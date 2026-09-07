# Design system

Both apps share one visual language, taken from the product design reference: a soft
lavender-grey canvas, white cards floating on it with generous corner radii and a low, wide
shadow, a crimson brand colour used for primary actions, and amber / sky / rose accents for
the supporting roles. Everything is token-based, so light and dark stay in step and a
rebrand is a change to a handful of variables.

## Tokens

Defined once in each app's `src/index.css` on `:root`, redefined under `[data-theme="dark"]`,
and exposed to Tailwind in `tailwind.config.js` as ordinary colour names. No component ever
hard-codes a hex value.

| Token | Light | Dark | Used for |
| --- | --- | --- | --- |
| `canvas` | `#eef0f6` | `#14161f` | Page background - the cards sit on it |
| `surface` | `#ffffff` | `#1c1f2b` | Cards, rows, sheets, bottom bar |
| `surface-2` | `#f7f8fc` | `#222634` | Insets: solution box, date tiles |
| `surface-3` | `#eef0f6` | `#2a2e3e` | Hover fills, neutral chips, icon tiles |
| `line` | `#e7e9f2` | `#2e3242` | Dividers and input borders |
| `fg` | `#2c3047` | `#eef0f6` | Primary text |
| `muted` | `#666d88` | `#a8aec6` | Secondary text |
| `subtle` | `#9aa0b8` | `#7c8299` | Meta text, placeholders |
| `brand` | `#c8102e` | `#ef4358` | Primary buttons, FAB, active tab, back chevron |
| `amber` | `#f5a623` | `#f5a623` | Stepper, chapter pills, "skipped" series |
| `sky` | `#2d9cdb` | `#4fb3e8` | Package select, question timer bar |
| `rose` | `#ee5a6f` | `#f4788a` | Third quick action |
| `success` / `warning` / `danger` | `#27ae60` / `#f2994a` / `#eb5757` | `#3ecf7d` / `#f2994a` / `#f47272` | Correct, caution, incorrect |

Each accent has a `-soft` companion for tinted backgrounds, so a status never relies on a
raw opacity modifier.

## Type

Poppins, four weights (400/500/600/700), with a system-font fallback. Headings are
semibold; most interface text is 13px or 14px; numbers use `tabular-nums` so timers, scores
and stat tiles do not jitter as they count. Lesson and question body copy is 17px at 1.7
line height, because it is read for minutes at a time rather than scanned.

## Shape and depth

- Radii: `xl` (16px) for cards and inputs, full for buttons, pills, chips and avatars.
- Cards carry no border - they are separated from the canvas by `--shadow-card`
  (`0 4px 20px` at 6% black), which is what gives the design its soft, floating feel.
- Buttons are fully rounded, 44px tall in the console and 48px in the student app
  (comfortably above Android's 44px touch-target minimum), and scale to 98% on press.
- The round red icon button (`.icon-btn`) is a recurring motif: list-row arrows, the back
  chevron, and the raised centre action in the bottom bar.

## Subject and course accents

A subject or course colour is data, so the palette lives in CSS. Each `tone-*` class sets
`--tone`, `--tone-soft` and `--tone-fg` for both themes, and four utilities read them:

```html
<article class="tone-blue card">
  <span class="tone-soft">P</span>    <!-- tinted badge -->
  <span class="tone-text">Physics</span>
  <div class="tone-bar"></div>        <!-- solid progress fill -->
</article>
```

`toneOf(colorTheme)` and `toneOfSubject(subject)` in `src/lib/theme.ts` return the class
name; `hexOfSubject()` returns the literal for SVG charts, where a class cannot reach.
Maths is red, Physics blue, Chemistry amber, English green.

## Charts

`src/components/charts.tsx` implements three marks with no charting dependency:

- **`Donut`** - a thick rounded ring with a number in the middle. Used three-up for
  correct / incorrect / seconds, and once for accuracy.
- **`MultiRing`** - concentric rings, one per subject, with the overall figure in the
  centre. This is the "All Subjects Overall Statistics" chart.
- **`BarChart`** - grouped vertical bars with a value axis and grid lines. One series for
  time-per-question, three (correct / incorrect / skipped) for the difficulty analysis.

All three read theme tokens for their track and grid colours, and carry an `aria-label`
describing the data, so a screen reader gets the numbers a sighted user reads off the axis.

## Theming

`useTheme()` stores `light`, `dark` or `system` in `localStorage` under `eduhub.theme` and
writes `data-theme` on `<html>`. With `system`, it follows the OS and keeps following it if
the OS setting changes mid-session. A matching inline script in each `index.html` applies
the same value before first paint, so there is no flash of the wrong theme, and it also
updates the `theme-color` meta tag so the Android status bar matches the brand.

The console exposes a toggle in the header and a three-way picker in Settings; the student
app has a toggle on Home and the picker in the Menu tab.

## Motion

Short and functional: 150ms colour transitions, a 180ms scale-in for dialogs, a 200ms
slide-up for sheets and toasts, a 600ms eased sweep on donut rings, and a linear
one-second step on the question countdown so it reads as a clock rather than an animation.
The confetti burst on a strong test result and on lesson completion is the only purely
celebratory motion, and it respects `prefers-reduced-motion`.

## Accessibility

Focus is never removed - `*:focus-visible` draws a 3px brand ring on every interactive
element. Colour is never the only signal: a wrong answer carries an X icon as well as red,
a correct one a check; locked tests carry a padlock and the word "Locked". Body and
secondary text meet WCAG AA against their surfaces in both themes.
