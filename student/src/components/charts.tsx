import { useMemo } from 'react';

// -----------------------------------------------------------------------------
// Dependency-free SVG charts, built to match the product design: thick rounded
// donut rings, a concentric multi-ring for per-subject progress, and compact
// bar charts. All colours come from the theme tokens so both themes work.
// -----------------------------------------------------------------------------

/** Turns a flat colour into a light-to-dark sweep for a ring or bar fill. */
function gradientStops(color: string): { from: string; to: string } {
  return { from: `${color}`, to: `${color}` };
}

let gradientSeed = 0;
/** SVG gradient ids must be unique per document, not per component instance. */
function nextGradientId(prefix: string): string {
  gradientSeed += 1;
  return `${prefix}-${gradientSeed}`;
}

interface DonutProps {
  /** 0-100. */
  percent: number;
  /** Big number in the middle; defaults to the percent. */
  label?: string;
  caption?: string;
  color: string;
  size?: number;
  stroke?: number;
}

export function Donut({ percent, label, caption, color, size = 72, stroke = 7 }: DonutProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const gradientId = useMemo(() => nextGradientId('donut'), []);
  const stops = gradientStops(color);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={stops.from} stopOpacity="0.75" />
              <stop offset="100%" stopColor={stops.to} stopOpacity="1" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--surface-3)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - clamped / 100)}
            style={{
              transition: 'stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1)',
              filter: `drop-shadow(0 2px 5px ${color}55)`,
            }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold tabular-nums">
          {label ?? `${Math.round(clamped)}%`}
        </span>
      </div>
      {caption && <span className="text-2xs text-subtle">{caption}</span>}
    </div>
  );
}

interface RingSpec {
  label: string;
  percent: number;
  color: string;
}

/**
 * Concentric rings, one per subject, with the overall figure in the middle -
 * the "All Subjects Overall Statistics" chart from the design.
 */
export function MultiRing({
  rings,
  overall,
  size = 172,
}: {
  rings: RingSpec[];
  overall: number;
  size?: number;
}) {
  const stroke = 9;
  const gap = 4;
  const gradientBase = useMemo(() => nextGradientId('ring'), []);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          {rings.map((ring, index) => (
            <linearGradient key={ring.label} id={`${gradientBase}-${index}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={ring.color} stopOpacity="0.7" />
              <stop offset="100%" stopColor={ring.color} stopOpacity="1" />
            </linearGradient>
          ))}
        </defs>
        {rings.map((ring, index) => {
          const radius = (size - stroke) / 2 - index * (stroke + gap);
          if (radius <= stroke) return null;
          const circumference = 2 * Math.PI * radius;
          return (
            <g key={ring.label}>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="var(--surface-3)"
                strokeWidth={stroke}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={`url(#${gradientBase}-${index})`}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - Math.min(100, ring.percent) / 100)}
                style={{
                  transition: 'stroke-dashoffset 700ms cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: `${index * 60}ms`,
                  filter: `drop-shadow(0 1px 4px ${ring.color}44)`,
                }}
              />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-semibold tabular-nums">{Math.round(overall)}%</span>
        <span className="text-2xs text-subtle">Overall</span>
      </div>
    </div>
  );
}

export interface BarSeries {
  label: string;
  color: string;
  values: number[];
}

/**
 * Grouped vertical bars - used for "Performance Analysis by Question Difficulty"
 * and, with one series, for "Time Taken for Each Question".
 */
export function BarChart({
  categories,
  series,
  height = 132,
  axisLabel,
  valueSuffix = '',
}: {
  categories: string[];
  series: BarSeries[];
  height?: number;
  axisLabel?: string;
  valueSuffix?: string;
}) {
  const max = Math.max(1, ...series.flatMap((item) => item.values));
  // Round the axis up to something readable rather than the raw maximum.
  const ceiling = max <= 5 ? 5 : Math.ceil(max / 10) * 10;
  const ticks = [ceiling, Math.round(ceiling / 2), 0];

  return (
    <div>
      <div className="flex gap-2">
        <div
          className="flex shrink-0 flex-col justify-between text-2xs tabular-nums text-subtle"
          style={{ height }}
          aria-hidden="true"
        >
          {ticks.map((tick) => (
            <span key={tick}>
              {tick}
              {valueSuffix}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between" aria-hidden="true">
            {ticks.map((tick) => (
              <span key={tick} className="h-px w-full bg-line" />
            ))}
          </div>

          <div
            className="relative flex items-end justify-around gap-1"
            style={{ height }}
            role="img"
            aria-label={`${axisLabel ?? 'Chart'}: ${categories
              .map(
                (category, index) =>
                  `${category} ${series.map((item) => `${item.label} ${item.values[index] ?? 0}`).join(', ')}`,
              )
              .join('; ')}`}
          >
            {categories.map((category, index) => (
              <div key={category} className="flex flex-1 items-end justify-center gap-[3px]">
                {series.map((item) => {
                  const value = item.values[index] ?? 0;
                  return (
                    <span
                      key={item.label}
                      className="w-full max-w-[10px] rounded-t-[3px] transition-[height] duration-500"
                      style={{
                        height: `${Math.max(value > 0 ? 3 : 0, (value / ceiling) * height)}px`,
                        backgroundImage: `linear-gradient(180deg, ${item.color} 0%, ${item.color}b0 100%)`,
                        boxShadow: value > 0 ? `0 2px 6px -2px ${item.color}80` : undefined,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-1.5 flex justify-around gap-1">
            {categories.map((category) => (
              <span key={category} className="flex-1 text-center text-2xs text-subtle">
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>

      {axisLabel && <p className="mt-1 text-center text-2xs text-subtle">{axisLabel}</p>}

      {series.length > 1 && (
        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {series.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5 text-2xs text-muted">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
