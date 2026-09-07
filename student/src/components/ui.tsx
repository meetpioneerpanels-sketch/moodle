import { useEffect, type ReactNode } from 'react';
import { Check, Lock, Monitor, Moon, Sun, X } from 'lucide-react';
import { useTheme, type ThemePreference } from '../hooks/useTheme';

// --- sheets ------------------------------------------------------------------

/** Bottom sheet on phones, centred dialog on wider screens. */
export function Sheet({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="glass-strong relative z-10 flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-3xl border shadow-lg animate-slide-up sm:max-w-md sm:rounded-3xl"
      >
        <header className="flex items-center gap-3 px-5 pb-3 pt-5">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="icon-btn relief-press ml-auto bg-surface text-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        {footer && <footer className="border-t border-line px-5 py-4 pb-safe">{footer}</footer>}
      </div>
    </div>
  );
}

// --- headers -----------------------------------------------------------------

/** The rounded back chevron + title row used on every inner screen. */
export function ScreenHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <header className="flex items-center gap-3 px-4 pb-3 pt-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="icon-btn fill-brand"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <h1 className="min-w-0 flex-1 truncate text-lg font-semibold">{title}</h1>
      {right}
    </header>
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
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      {icon && (
        <span className="relief flex h-11 w-11 items-center justify-center rounded-full bg-surface text-muted">
          {icon}
        </span>
      )}
      <div>
        <p className="text-sm font-semibold">{title}</p>
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

// --- bits --------------------------------------------------------------------

export function LiveDot({ live }: { live: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex h-1.5 w-1.5">
        {live && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${live ? 'bg-success' : 'bg-line-strong'}`} />
      </span>
      <span className="text-2xs font-medium text-subtle">{live ? 'Live' : 'Offline'}</span>
    </span>
  );
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
  const dimensions =
    size === 'lg' ? 'h-20 w-20 text-xl' : size === 'sm' ? 'h-8 w-8 text-2xs' : 'h-10 w-10 text-[13px]';
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand-on-soft ${dimensions}`}
      aria-hidden="true"
    >
      {initials || '·'}
    </span>
  );
}

export function ProgressBar({ value, total }: { value: number; total: number }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
      <div
        className="tone-bar h-full rounded-full transition-all duration-500"
        style={{ width: `${percent}%`, backgroundColor: 'var(--tone, var(--brand))' }}
      />
    </div>
  );
}

export function ProgressRing({
  value,
  total,
  size = 38,
  stroke = 3.5,
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
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--tone, var(--brand))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
          style={{ transition: 'stroke-dashoffset 400ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <span className="absolute text-2xs font-semibold tabular-nums text-muted">{percent}</span>
    </span>
  );
}

export function LockPill({ locked }: { locked: boolean }) {
  return locked ? (
    <span className="inline-flex items-center gap-1 text-[13px] text-subtle">
      <Lock className="h-3.5 w-3.5" /> Locked
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[13px] font-medium text-success">
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success text-white">
        <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      Start
    </span>
  );
}

/** Numbered progress stepper from the package-selection flow. */
export function Stepper({ steps, current }: { steps: number; current: number }) {
  return (
    <div className="flex items-center px-1" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={steps}>
      {Array.from({ length: steps }).map((_, index) => {
        const step = index + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-2xs font-semibold transition-all ${
                done
                  ? 'fill-amber'
                  : active
                    ? 'fill-amber ring-4 ring-amber-soft'
                    : 'relief-sm bg-surface text-subtle'
              }`}
            >
              {done ? <Check className="h-3 w-3" strokeWidth={3} /> : step}
            </span>
            {step < steps && (
              <span
                className={`mx-1 h-px flex-1 ${done ? 'bg-amber' : 'border-t border-dashed border-line-strong'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Underlined tab row, as used for Subjects and Performance/Progress. */
export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  size = 'md',
}: {
  tabs: readonly T[];
  active: T;
  onChange: (tab: T) => void;
  size?: 'sm' | 'md';
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-5 overflow-x-auto border-b border-line px-4">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          aria-current={active === tab ? 'page' : undefined}
          className={`relative shrink-0 pb-2.5 font-medium transition-colors ${
            size === 'sm' ? 'text-[13px]' : 'text-sm'
          } ${active === tab ? 'text-fg' : 'text-subtle'}`}
        >
          {tab}
          {active === tab && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand" />
          )}
        </button>
      ))}
    </div>
  );
}

/** Pill row, as used for chapter selection. */
export function PillTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly T[];
  active: T;
  onChange: (tab: T) => void;
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          aria-pressed={active === tab}
          className={`h-8 shrink-0 rounded-lg px-4 text-[13px] font-semibold transition-all ${
            active === tab ? 'fill-amber' : 'relief-press bg-surface text-muted'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
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
      className="icon-btn relief-press bg-surface text-muted"
    >
      {resolved === 'dark' ? <Sun className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} /> : <Moon style={{ width: 18, height: 18 }} />}
    </button>
  );
}

export function ThemePicker() {
  const { preference, setPreference } = useTheme();
  return (
    <div className="relief-inset flex rounded-xl bg-surface-2 p-1">
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setPreference(value)}
          aria-pressed={preference === value}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-medium transition-colors ${
            preference === value ? 'relief-sm bg-surface text-fg' : 'text-muted'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
