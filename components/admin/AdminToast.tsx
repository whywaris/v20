'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export type AdminToast = (msg: string, type?: 'success' | 'error') => void;

const Ctx = createContext<AdminToast>(() => {});
export const useAdminToast = () => useContext(Ctx);

/** Success / error toasts for the admin pages. */
export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error'; id: number } | null>(null);
  const show = useCallback<AdminToast>((msg, type = 'success') => {
    const id = Date.now();
    setToast({ msg, type, id });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 4000);
  }, []);

  return (
    <Ctx.Provider value={show}>
      {children}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-[60] flex max-w-sm items-start gap-2 rounded-xl border px-4 py-3 text-[13px] font-semibold shadow-2xl ${
            toast.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-950 text-emerald-200'
              : 'border-rose-500/40 bg-rose-950 text-rose-200'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <AlertCircle className="mt-0.5 size-4 shrink-0" />}
          {toast.msg}
        </div>
      )}
    </Ctx.Provider>
  );
}
