'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { cn } from './cn';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;   // ms, 0 = persistent
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// ─── Module-level imperative API ─────────────────────────────────────────────

let _addToast: ToastContextValue['addToast'] | null = null;

export function createToast(toast: Omit<Toast, 'id'>): string {
  if (!_addToast) {
    console.warn('[Toast] ToastProvider not mounted');
    return '';
  }
  return _addToast(toast);
}

// ─── Individual Toast item ────────────────────────────────────────────────────

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={16} aria-hidden />,
  error:   <XCircle size={16} aria-hidden />,
  info:    <Info size={16} aria-hidden />,
};

const styleMap: Record<ToastType, string> = {
  success: 'border-white/14 text-[#D4D4D4]',
  error:   'border-white/10 text-[#C0A0A0]',
  info:    'border-white/10 text-[#A0A0A0]',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      role="alert"
      aria-live="polite"
      className={cn(
        'relative flex items-start gap-3 w-full max-w-sm',
        'bg-[#111111] border rounded-xl px-4 py-3.5 shadow-card',
        'backdrop-blur-[24px]',
        styleMap[toast.type],
      )}
    >
      <span className="mt-0.5 flex-shrink-0 opacity-70">{iconMap[toast.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="font-sans text-[13px] font-medium text-[#F5F5F5] leading-snug">
          {toast.title}
        </p>
        {toast.description && (
          <p className="font-sans text-[12px] text-[#555555] mt-0.5 leading-snug">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={onRemove}
        aria-label="Dismiss notification"
        className="flex-shrink-0 text-[#555555] hover:text-[#A0A0A0] transition-colors p-0.5 -mr-1 -mt-0.5"
      >
        <X size={14} aria-hidden />
      </button>
    </motion.li>
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>): string => {
      const id = Math.random().toString(36).slice(2);
      const duration = toast.duration ?? 4000;
      setToasts((prev) => [...prev, { ...toast, id, duration }]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
      return id;
    },
    [removeToast],
  );

  // Expose imperative API
  _addToast = addToast;

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}

      {/* Portal-like fixed container */}
      <div
        aria-label="Notifications"
        className={cn(
          'fixed z-[9999] flex flex-col gap-2 pointer-events-none',
          // Bottom-right on desktop, bottom-center on mobile
          'bottom-4 right-4 items-end',
          'sm:bottom-6 sm:right-6',
        )}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto w-full sm:w-auto">
              <ToastItem
                toast={toast}
                onRemove={() => removeToast(toast.id)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useToast() {
  return useToastContext();
}
