import type { ReactNode } from 'react';

// --- progress ----------------------------------------------------------------

export function ProgressRing({
  value,
  total,
  size = 44,
  stroke = 5,
  color = '#58CC02',
}: {
  value: number;
  total: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${percent}% complete`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E5E5"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 400ms ease' }}
        />
      </svg>
      <span
        className="absolute text-[10px] font-extrabold text-ink"
        style={{ fontSize: Math.max(9, size / 4.4) }}
      >
        {percent}%
      </span>
    </span>
  );
}

export function ProgressBar({ value, total }: { value: number; total: number }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-swan">
      <div
        className="h-full rounded-full bg-grass transition-all duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

// --- states ------------------------------------------------------------------

export function EmptyState({
  emoji,
  title,
  action,
}: {
  emoji: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-swan px-6 py-12 text-center">
      <span className="text-6xl" aria-hidden="true">
        {emoji}
      </span>
      <p className="max-w-xs text-lg font-extrabold text-wolf">{title}</p>
      {action}
    </div>
  );
}

export function SkeletonList({ rows = 3, height = 'h-24' }: { rows?: number; height?: string }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className={`skeleton ${height} w-full`} />
      ))}
    </div>
  );
}

export function SkeletonRow({ height = 'h-6', width = 'w-32' }: { height?: string; width?: string }) {
  return <div className={`skeleton ${height} ${width}`} />;
}

export function LiveDot({ live }: { live: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-grass/10 px-2.5 py-1">
      <span className="relative flex h-2 w-2">
        {live && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-grass opacity-75" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${live ? 'bg-grass' : 'bg-swan'}`}
        />
      </span>
      <span className="text-[10px] font-extrabold uppercase tracking-wide text-grass-dark">
        {live ? 'Live' : 'Offline'}
      </span>
    </span>
  );
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-grass font-extrabold text-white ${
        size === 'lg' ? 'h-20 w-20 text-2xl' : 'h-11 w-11 text-sm'
      }`}
      aria-hidden="true"
    >
      {initials || '🎓'}
    </span>
  );
}
