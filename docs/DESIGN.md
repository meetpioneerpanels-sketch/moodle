# Design system

Both apps share one visual language: a refined, minimal interface that keeps the reader's
attention on course content rather than on the chrome around it. Everything is token-based,
so light and dark stay in step and a rebrand is a change to a handful of variables.

## Tokens

Defined once in each app's `src/index.css` on `:root`, redefined under `[data-theme="dark"]`,
and exposed to Tailwind in `tailwind.config.js` as ordinary colour names. No component ever
hard-codes a hex value.

| Token | Light | Dark | Used for |
| --- | --- | --- | --- |
| `canvas` | `#ffffff` | `#09090b` | Page background |
| `surface` | `#ffffff` | `#121216` | Cards, rows, sticky bars |
| `surface-2` | `#fafafa` | `#161619` | Sidebar, table headers, insets |
| `surface-3` | `#f4f4f5` | `#1f1f25` | Hover fills, neutral chips |
| `line` | `#e4e4e7` | `#27272e` | All 1px borders and dividers |
| `fg` | `#18181b` | `#f4f4f5` | Primary text |
| `muted` | `#52525b` | `#a1a1aa` | Secondary text |
| `subtle` | `#8b8b93` | `#7a7a85` | Meta text, placeholders, icons |
| `accent` | `#4f46e5` | `#6366f1` | Primary actions, active nav, focus |
| `success` / `warning` / `danger` | `#059669` / `#b45309` / `#dc2626` | `#34d399` / `#fbbf24` / `#f87171` | Status only |

Each semantic colour has a `-soft` companion for tinted backgrounds, so a status never
relies on a raw opacity modifier.

## Type

Inter, four weights (400/500/600/700), with a system-font fallback stack. The scale is
deliberately narrow — most interface text is 13px or 14px, headings are 18–22px at
`-0.015em` to `-0.02em` tracking, and weight (not size) carries most of the hierarchy.
Numbers use `tabular-nums` so stat cards and progress counters do not jitter.

The one exception is lesson body copy in the student app: 17px at 1.7 line height, as
specified in the build kit, because it is read for minutes at a time rather than scanned.

## Shape and depth

- Radii: `lg` (10px) for controls, `xl` (12px) for cards, full for pills and avatars.
- Borders do the work that shadows used to: a single `1px solid var(--line)` on every card,
  row and input. Shadows are reserved for things that float — modals, toasts, the active
  nav pill.
- Buttons are 40px tall in the console and 44px in the student app (Android's touch-target
  minimum), filled for primary actions and bordered for everything else.

## Course accents

A course's `colorTheme` field is data, so the palette lives in CSS. Each `tone-*` class sets
`--tone`, `--tone-soft` and `--tone-fg` for both themes, and four utilities read them:

```html
<article class="tone-blue card">
  <span class="tone-soft">🧮</span>   <!-- tinted badge -->
  <span class="tone-text">Math</span> <!-- accent-coloured label -->
  <div class="tone-bar"></div>        <!-- solid progress fill -->
</article>
```

`toneOf(course.colorTheme)` in `src/lib/theme.ts` returns the class name. This keeps the
five course colours legible on both a white and a near-black background without a second
palette or any per-component branching.

## Theming

`useTheme()` stores `light`, `dark` or `system` in `localStorage` under `eduhub.theme` and
writes `data-theme` on `<html>`. With `system`, it follows the OS and keeps following it if
the OS setting changes mid-session. A matching inline script in each `index.html` applies
the same value before first paint, so there is no flash of the wrong theme, and it also
updates the `theme-color` meta tag so the Android status bar matches the app.

The console exposes a toggle in the header and a three-way picker in Settings; the student
app has a toggle on Home and the picker in Profile.

## Motion

Short and functional: 150ms colour transitions, a 160ms scale-in for modals, a 180ms
slide-up for toasts, and a 400ms eased sweep on progress rings and bars. The confetti burst
on first publish and lesson completion is the one piece of purely celebratory motion, and it
respects `prefers-reduced-motion`.

## Accessibility

Focus is never removed — `*:focus-visible` draws a 3px accent ring on every interactive
element. Colour is never the only signal: published state, progress and errors all carry
text or an icon alongside the hue. Body and secondary text meet WCAG AA against their
surfaces in both themes.
