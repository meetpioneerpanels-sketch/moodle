import { useEffect, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { Check, Monitor, Moon, Sun, X } from 'lucide-react';
import { useTheme, type ThemePreference } from '../hooks/useTheme';

// --- modal -------------------------------------------------------------------

interface ModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

export function Modal({ open, title, subtitle, onClose, children, footer, wide }: ModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-lg animate-scale-in sm:rounded-2xl ${
          wide ? 'sm:max-w-2xl' : 'sm:max-w-md'
        }`}
      >
        <header className="flex items-start gap-3 px-5 pb-4 pt-5">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold">{title}</h2>
            {subtitle && <p className="mt-0.5 truncate text-[13px] text-subtle">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-auto -mr-1 -mt-1 rounded-md p-1.5 text-subtle transition-colors hover:bg-surface-3 hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        {footer && (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-line bg-surface-2 px-5 py-3.5">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

// --- confirm dialog ----------------------------------------------------------

interface ConfirmProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn-secondary btn-sm" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-danger btn-sm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-muted">{message}</p>
    </Modal>
  );
}

// --- empty state -------------------------------------------------------------

interface EmptyStateProps {
  icon?: ReactNode;
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, emoji, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line px-6 py-14 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-3 text-subtle">
        {icon ?? <span className="text-lg">{emoji ?? '·'}</span>}
      </span>
      <div>
        <p className="text-sm font-medium text-fg">{title}</p>
        {description && <p className="mt-1 text-[13px] text-subtle">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// --- skeletons ---------------------------------------------------------------

export function SkeletonList({ rows = 3, height = 'h-16' }: { rows?: number; height?: string }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className={`skeleton ${height} w-full`} />
      ))}
    </div>
  );
}

export function SkeletonGrid({ cards = 6 }: { cards?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="skeleton h-40 w-full" />
      ))}
    </div>
  );
}

// --- status ------------------------------------------------------------------

export function LiveDot({ live }: { live: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1"
      title={live ? 'Realtime listeners are attached' : 'Not connected'}
    >
      <span className="relative flex h-1.5 w-1.5">
        {live && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
        )}
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${live ? 'bg-success' : 'bg-line-strong'}`}
        />
      </span>
      <span className="text-2xs font-medium tracking-wide text-muted">
        {live ? 'Live' : 'Offline'}
      </span>
    </span>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  /** The event is passed through so callers can anchor an animation at the switch. */
  onChange: (next: boolean, event: ReactMouseEvent) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      disabled={disabled}
      aria-checked={checked}
      aria-label={label}
      onClick={(event) => onChange(!checked, event)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150 disabled:opacity-40 ${
        checked ? 'bg-accent' : 'bg-line-strong'
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-xs transition-all duration-150 ${
          checked ? 'left-[1.125rem]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

export function RoleChip({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: 'bg-accent-soft text-accent-on-soft',
    teacher: 'bg-surface-3 text-fg',
    student: 'bg-surface-3 text-muted',
  };
  return <span className={`chip capitalize ${styles[role] ?? 'chip-neutral'}`}>{role}</span>;
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
  const dimensions =
    size === 'lg' ? 'h-16 w-16 text-lg' : size === 'sm' ? 'h-7 w-7 text-2xs' : 'h-8 w-8 text-xs';
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-medium text-accent-on-soft ${dimensions}`}
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
  { value: 'system', label: 'System', icon: Monitor },
];

/** Compact icon button that flips between light and dark. */
export function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-3 hover:text-fg"
    >
      {resolved === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

/** Three-way segmented control for the settings screen. */
export function ThemePicker() {
  const { preference, setPreference } = useTheme();
  return (
    <div className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5">
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setPreference(value)}
          aria-pressed={preference === value}
          className={`inline-flex items-center gap-1.5 rounded-[7px] px-3 py-1.5 text-[13px] font-medium transition-colors ${
            preference === value
              ? 'bg-surface text-fg shadow-xs'
              : 'text-muted hover:text-fg'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
          {preference === value && <Check className="h-3 w-3 opacity-0" aria-hidden="true" />}
        </button>
      ))}
    </div>
  );
}
