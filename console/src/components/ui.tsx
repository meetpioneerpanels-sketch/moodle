import { useEffect, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-slide-up sm:rounded-3xl ${
          wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'
        }`}
      >
        <header className="flex items-start gap-3 border-b-2 border-swan px-6 py-5">
          <div className="min-w-0">
            <h2 className="text-xl">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm font-bold text-wolf">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-auto rounded-full p-2 text-wolf transition-colors hover:bg-swan/40 hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <footer className="flex flex-wrap justify-end gap-3 border-t-2 border-swan px-6 py-4">
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
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <span className="text-4xl" aria-hidden="true">
          ⚠️
        </span>
        <p className="pt-1 font-bold text-wolf">{message}</p>
      </div>
    </Modal>
  );
}

// --- empty state -------------------------------------------------------------

interface EmptyStateProps {
  emoji: string;
  title: string;
  action?: ReactNode;
}

export function EmptyState({ emoji, title, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-swan px-6 py-14 text-center">
      <span className="text-6xl" aria-hidden="true">
        {emoji}
      </span>
      <p className="max-w-sm text-lg font-extrabold text-wolf">{title}</p>
      {action}
    </div>
  );
}

// --- skeletons ---------------------------------------------------------------

export function SkeletonList({ rows = 3, height = 'h-20' }: { rows?: number; height?: string }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className={`skeleton ${height} w-full`} />
      ))}
    </div>
  );
}

export function SkeletonGrid({ cards = 6 }: { cards?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="skeleton h-44 w-full" />
      ))}
    </div>
  );
}

// --- misc --------------------------------------------------------------------

export function LiveDot({ live }: { live: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full bg-grass/10 px-3 py-1.5"
      title={live ? 'Realtime listeners are attached' : 'Not connected'}
    >
      <span className="relative flex h-2.5 w-2.5">
        {live && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-grass opacity-75" />
        )}
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${live ? 'bg-grass' : 'bg-swan'}`}
        />
      </span>
      <span className="text-xs font-extrabold uppercase tracking-wide text-grass-dark">
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
      className={`relative h-7 w-12 shrink-0 rounded-full border-2 transition-colors disabled:opacity-50 ${
        checked ? 'border-grass-dark bg-grass' : 'border-swan bg-gray-200'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          checked ? 'left-[1.4rem]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

export function RoleChip({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: 'bg-beetle/20 text-beetle-dark',
    teacher: 'bg-macaw/20 text-macaw-dark',
    student: 'bg-grass/20 text-grass-dark',
  };
  return <span className={`chip ${styles[role] ?? 'bg-swan text-wolf'}`}>{role}</span>;
}
