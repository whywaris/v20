'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, Copy, Bookmark, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'copy' | 'bookmark' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg: string) => {
        if (typeof window !== 'undefined') {
          console.log('[Toast fallback]', msg);
        }
      }
    };
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const Icon =
            toast.type === 'copy'
              ? Copy
              : toast.type === 'bookmark'
              ? Bookmark
              : toast.type === 'info'
              ? AlertCircle
              : CheckCircle2;

          const iconColor =
            toast.type === 'bookmark'
              ? 'text-amber-500'
              : toast.type === 'copy'
              ? 'text-[var(--brand-mark)]'
              : 'text-emerald-500';

          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl glass border border-[var(--border-line-strong)] shadow-2xl backdrop-blur-xl bg-[var(--bg-surface)]/95 text-[var(--text-ink)] animate-toast-slide-up transition-all"
              style={{
                boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.35), 0 0 1px 1px var(--border-line)'
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-1.5 rounded-xl bg-[var(--bg-surface-2)] shrink-0 ${iconColor}`}>
                  <Icon className="size-4" />
                </div>
                <span className="text-[13px] font-semibold leading-snug truncate">
                  {toast.message}
                </span>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--bg-surface-2)] transition-colors shrink-0"
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
