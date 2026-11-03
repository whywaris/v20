'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit, Eye, EyeOff, ExternalLink, Plus, RefreshCw, RotateCcw, Search, X } from 'lucide-react';
import { useAdminToast } from '@/components/admin/AdminToast';
import { STATUS_BADGE, btnGhost, cardCls, inputCls, labelCls } from '@/components/admin/ui';

// Shared list + edit modal for /admin/channels and /admin/niches. Edits are stored as Supabase overrides
// (see lib/admin-store.ts) and show on the live site within seconds.

type Item = Record<string, unknown> & { _status: 'edited' | 'hidden' | 'new' | null };

export type Field = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'textarea';
  options?: string[];
  get: (item: Item) => unknown;
  required?: boolean;
  wide?: boolean;
  placeholder?: string;
};

export type CatalogConfig = {
  noun: string; // "channel" / "niche"
  api: string;
  keyField: 'id' | 'slug';
  publicPath: (key: string) => string;
  fields: Field[];
  /** Columns after the name: [label, render] */
  columns: [string, (item: Item) => React.ReactNode][];
  title: (item: Item) => string;
  subtitle: (item: Item) => string;
  image?: (item: Item) => string | null;
};

const STATUSES = [
  ['', 'All'],
  ['edited', 'Edited'],
  ['hidden', 'Hidden'],
  ['new', 'Added'],
] as const;

export default function CatalogManager({ config, initialStatus = '', initialSearch = '', openNew = false, prefill }: {
  config: CatalogConfig;
  initialStatus?: string;
  initialSearch?: string;
  openNew?: boolean;
  prefill?: Record<string, string>;
}) {
  const toast = useAdminToast();
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<{ key: string | null; values: Record<string, unknown> } | null>(
    openNew ? { key: null, values: { ...prefill } } : null
  );
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);
  const limit = 20;

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${config.api}?${new URLSearchParams({ search, status, page: String(page), limit: String(limit) })}`, { signal: ctrl.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load');
        setItems(data.items);
        setTotal(data.total);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') toast((e as Error).message, 'error');
      } finally {
        setLoading(false);
      }
    }, search ? 250 : 0);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [config.api, search, status, page, reload, toast]);

  const call = useCallback(
    async (method: string, body?: object, query = '') => {
      const res = await fetch(`${config.api}${query}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    },
    [config.api]
  );

  const act = async (fn: () => Promise<unknown>, done: string) => {
    try {
      await fn();
      toast(done);
      setReload((r) => r + 1);
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const keyOf = (item: Item) => String(item[config.keyField]);
  const openEdit = (item: Item) =>
    setForm({ key: keyOf(item), values: Object.fromEntries(config.fields.map((f) => [f.name, f.get(item)])) });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    await act(
      () => (form.key ? call('PUT', { ...form.values, [config.keyField]: form.key }) : call('POST', form.values)),
      form.key ? `Saved. The live ${config.noun} page updates in a few seconds.` : `${cap(config.noun)} added.`
    );
    setSaving(false);
    setForm(null);
  };

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={`Search ${config.noun}s…`}
            className={`${inputCls} pl-9`}
          />
        </div>
        <div className="flex rounded-xl border border-[var(--border-line)] p-1">
          {STATUSES.map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                setStatus(v);
                setPage(1);
              }}
              className={`h-8 rounded-lg px-3 text-[12.5px] font-semibold ${status === v ? 'bg-[var(--bg-surface-2)] text-[var(--text-ink)]' : 'text-[var(--text-muted)]'}`}
            >
              {l}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setReload((r) => r + 1)} className={btnGhost} aria-label="Reload">
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <button type="button" onClick={() => setForm({ key: null, values: {} })} className="btn-accent inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-[12.5px]">
          <Plus className="size-4" /> Add {config.noun}
        </button>
      </div>

      <div className={`${cardCls} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-[var(--border-line)] bg-[var(--bg-surface-2)] text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">{cap(config.noun)}</th>
                {config.columns.map(([label]) => (
                  <th key={label} className="px-3 py-3 font-semibold">{label}</th>
                ))}
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-line)]">
              {items.map((item) => {
                const key = keyOf(item);
                return (
                  <tr key={key} className={item._status === 'hidden' ? 'opacity-55' : ''}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        {config.image && (
                          <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-[var(--bg-surface-2)] text-[11px] font-bold uppercase text-[var(--text-muted)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {config.image(item) ? <img src={config.image(item)!} alt="" referrerPolicy="no-referrer" className="size-full object-cover" /> : config.title(item).charAt(0)}
                          </span>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="max-w-[260px] truncate font-semibold text-[var(--text-ink)]">{config.title(item)}</span>
                            {item._status && <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${STATUS_BADGE[item._status]}`}>{item._status === 'new' ? 'added' : item._status}</span>}
                          </div>
                          <div className="max-w-[260px] truncate text-[12px] text-[var(--text-muted)]">{config.subtitle(item)}</div>
                        </div>
                      </div>
                    </td>
                    {config.columns.map(([label, render]) => (
                      <td key={label} className="num-mono whitespace-nowrap px-3 py-2.5 text-[var(--text-ink)]">{render(item)}</td>
                    ))}
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1">
                        <Link href={config.publicPath(key)} target="_blank" className={btnGhost} aria-label="Open public page" title="Open public page">
                          <ExternalLink className="size-3.5" />
                        </Link>
                        <button type="button" onClick={() => openEdit(item)} className={btnGhost} title="Edit">
                          <Edit className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          title={item._status === 'hidden' ? 'Show on site' : 'Hide from site'}
                          onClick={() => act(() => call('PUT', { [config.keyField]: key, hidden: item._status !== 'hidden' }), item._status === 'hidden' ? 'Visible on the site again.' : 'Hidden from the site.')}
                          className={btnGhost}
                        >
                          {item._status === 'hidden' ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                        </button>
                        {item._status && (
                          <button
                            type="button"
                            title={item._status === 'new' ? `Delete this added ${config.noun}` : 'Reset to original'}
                            onClick={() => {
                              const msg = item._status === 'new' ? `Delete "${config.title(item)}"?` : `Undo all edits to "${config.title(item)}"?`;
                              if (confirm(msg)) act(() => call('DELETE', undefined, `?${config.keyField}=${encodeURIComponent(key)}`), item._status === 'new' ? 'Deleted.' : 'Reset to original.');
                            }}
                            className={btnGhost}
                          >
                            <RotateCcw className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && !items.length && (
                <tr>
                  <td colSpan={config.columns.length + 2} className="px-4 py-10 text-center text-[var(--text-muted)]">Nothing found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[var(--border-line)] px-4 py-3 text-[12.5px] text-[var(--text-muted)]">
          <span>{total.toLocaleString()} {config.noun}s</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={btnGhost}>Prev</button>
            <span className="num-mono">{page} / {pages}</span>
            <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className={btnGhost}>Next</button>
          </div>
        </div>
      </div>

      {form && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <form onSubmit={save} className={`${cardCls} my-8 w-full max-w-xl p-6 shadow-2xl`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--text-ink)]">{form.key ? `Edit ${config.noun}` : `Add ${config.noun}`}</h2>
              <button type="button" onClick={() => setForm(null)} className={btnGhost} aria-label="Close">
                <X className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {config.fields.map((f) => {
                const v = form.values[f.name];
                const set = (val: unknown) => setForm((s) => s && { ...s, values: { ...s.values, [f.name]: val } });
                if (f.type === 'checkbox')
                  return (
                    <label key={f.name} className="flex items-center gap-2 text-[13px] font-semibold text-[var(--text-ink)] sm:col-span-2">
                      <input type="checkbox" checked={Boolean(v)} onChange={(e) => set(e.target.checked)} className="size-4 accent-[var(--brand-mark)]" />
                      {f.label}
                    </label>
                  );
                return (
                  <label key={f.name} className={f.wide || f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                    <span className={labelCls}>{f.label}</span>
                    {f.type === 'select' ? (
                      <select value={String(v ?? '')} onChange={(e) => set(e.target.value)} className={inputCls}>
                        <option value="">—</option>
                        {f.options!.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    ) : f.type === 'textarea' ? (
                      <textarea value={String(v ?? '')} onChange={(e) => set(e.target.value)} rows={3} className={`${inputCls} h-auto py-2`} />
                    ) : (
                      <input
                        type={f.type}
                        step={f.type === 'number' ? 'any' : undefined}
                        min={f.type === 'number' ? 0 : undefined}
                        required={f.required && !form.key}
                        value={String(v ?? '')}
                        placeholder={f.placeholder}
                        onChange={(e) => set(e.target.value)}
                        className={`${inputCls} ${f.type === 'number' ? 'num-mono' : ''}`}
                      />
                    )}
                  </label>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-[var(--border-line)] pt-4">
              <button type="button" onClick={() => setForm(null)} className={btnGhost}>Cancel</button>
              <button type="submit" disabled={saving} className="btn-accent h-9 rounded-xl px-4 text-[13px] disabled:opacity-50">
                {saving ? 'Saving…' : form.key ? 'Save changes' : `Add ${config.noun}`}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
