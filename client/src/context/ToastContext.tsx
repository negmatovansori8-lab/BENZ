import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { dict } from '../i18n/dict';
import { isUnverifiedText } from '../utils/authErrors';

type ToastKind = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

const ToastContext = createContext<{ push: (message: string, kind?: ToastKind) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = Date.now() + Math.random();
    const text = isUnverifiedText(message) ? dict.tg.authEmailNotConfirmed : message;
    setToasts((t) => [...t, { id, kind, message: text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-[80] flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-card backdrop-blur ${
              t.kind === 'error'
                ? 'border-red-500/30 bg-red-950/80 text-red-100'
                : t.kind === 'success'
                  ? 'border-emerald-500/30 bg-emerald-950/80 text-emerald-50'
                  : 'border-gold-500/30 bg-zinc-950/85 text-white'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast');
  return ctx;
}
