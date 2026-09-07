import type { ReactNode } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemePreference } from '../hooks/useTheme';

// --- progress ----------------------------------------------------------------

export function ProgressRing({
  value,
  total,
  size = 36,
  stroke = 3,
}: {
  value: number;
  total: number;
  size?: number;
  stroke?: number;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

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
          stroke="var(--line)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--tone, var(--accent))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
          style={{ transition: 'stroke-dashoffset 400ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <span
        className="absolute font-medium tabular-nums text-muted"
        style={{ fontSize: Math.max(9, size / 4) }}
      >
        {percent}
      </span>
    </span>
  );
}

export function ProgressBar({ value, total }: { value: number; total: number }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-line">
      <div
        className="tone-bar h-full rounded-full transition-all duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

// --- states ------------------------------------------------------------------

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line px-6 py-12 text-center">
      {icon && (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-3 text-subtle">
          {icon}
        </span>
      )}
      <div>
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="mt-1 text-[13px] text-subtle">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function SkeletonList({ rows = 3, height = 'h-20' }: { rows?: number; height?: string }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className={`skeleton ${height} w-full`} />
      ))}
    </div>
  );
}

export function LiveDot({ live }: { live: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex h-1.5 w-1.5">
        {live && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
        )}
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${live ? 'bg-success' : 'bg-line-strong'}`}
        />
      </span>
      <span className="text-2xs font-medium text-subtle">{live ? 'Live' : 'Offline'}</span>
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
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-medium text-accent-on-soft ${
        size === 'lg' ? 'h-16 w-16 text-lg' : 'h-9 w-9 text-[13px]'
      }`}
      aria-hidden="true"
    >
      {initials || '·'}
    </span>
  );
}

// --- theme -------------------------------------------------------------------

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'Auto', icon: Monitor },
];

export function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors active:bg-surface-3"
    >
      {resolved === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function ThemePicker() {
  const { preference, setPreference } = useTheme();
  return (
    <div className="flex rounded-lg border border-line bg-surface-2 p-0.5">
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setPreference(value)}
          aria-pressed={preference === value}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-[7px] py-2 text-[13px] font-medium transition-colors ${
            preference === value ? 'bg-surface text-fg shadow-xs' : 'text-muted'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
