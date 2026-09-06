import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const STYLES: Record<ToastKind, { ring: string; icon: ReactNode }> = {
  success: {
    ring: 'border-grass',
    icon: <CheckCircle2 className="h-5 w-5 text-grass" />,
  },
  error: {
    ring: 'border-cardinal',
    icon: <AlertTriangle className="h-5 w-5 text-cardinal" />,
  },
  info: {
    ring: 'border-macaw',
    icon: <Info className="h-5 w-5 text-macaw" />,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, kind: ToastKind = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, kind, message }]);
      window.setTimeout(() => dismiss(id), 3600);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-24 right-4 z-[60] flex flex-col gap-2 sm:bottom-6 sm:right-6">
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={`flex items-center gap-3 rounded-2xl border-2 ${STYLES[item.kind].ring} bg-white px-4 py-3 shadow-lg animate-slide-up max-w-[min(92vw,22rem)]`}
          >
            {STYLES[item.kind].icon}
            <p className="text-sm font-bold text-ink">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss notification"
              className="ml-auto text-wolf hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}
