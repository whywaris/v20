'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { marked } from 'marked';
import { Edit, Eye, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import type { Post } from '@/lib/posts';

type Toast = (msg: string, type: 'success' | 'error') => void;
type Form = {
  originalSlug: string | null;
  title: string; slug: string; category: string; coverImage: string; excerpt: string; content: string;
  status: 'published' | 'draft';
};

const EMPTY: Form = { originalSlug: null, title: '', slug: '', category: '', coverImage: '', excerpt: '', content: '', status: 'published' };
const input = 'w-full h-10 px-3 rounded-xl text-[13px] bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-mark)]';
const label = 'block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1';
const slugify = (s: string) => s.toLowerCase().trim().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/** Admin "Blog Management" tab: list, write, edit and delete posts (stored in Supabase via /api/admin/posts). */
export default function BlogManager({ showToast }: { showToast: Toast }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  // State only changes after the request returns, so this is safe to start from an effect.
  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/admin/posts');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load posts');
      setPosts(data.posts);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  };
  const load = () => {
    setLoading(true);
    fetchPosts();
  };
  // The parent recreates showToast on every render; keep the latest in a ref so the first load runs exactly once.
  const toastRef = useRef(showToast);
  useEffect(() => { toastRef.current = showToast; });
  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/posts')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load posts');
        if (!cancelled) setPosts(data.posts);
      })
      .catch((e) => !cancelled && toastRef.current(e instanceof Error ? e.message : 'Failed to load posts', 'error'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const openNew = () => { setForm(EMPTY); setSlugTouched(false); setPreview(false); };
  const openEdit = (p: Post) => {
    setForm({ originalSlug: p.source === 'database' ? p.slug : null, title: p.title, slug: p.slug, category: p.category, coverImage: p.coverImage, excerpt: p.excerpt, content: p.content, status: p.status });
    setSlugTouched(true);
    setPreview(false);
  };
  const set = (k: keyof Form, v: string) =>
    setForm((f) => f && { ...f, [k]: v, ...(k === 'title' && !slugTouched ? { slug: slugify(v) } : {}) });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      showToast(form.status === 'published' ? 'Article published' : 'Draft saved', 'success');
      setForm(null);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Post) => {
    if (!confirm(`Delete "${p.title}"? This can't be undone.`)) return;
    const res = await fetch(`/api/admin/posts?slug=${encodeURIComponent(p.slug)}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (res.ok) { showToast('Article deleted', 'success'); load(); }
    else showToast(data.error || 'Failed to delete', 'error');
  };

  // Admin-only preview of the admin's own Markdown.
  const previewHtml = useMemo(() => (form && preview ? (marked.parse(form.content || '*Nothing to preview yet.*') as string) : ''), [form, preview]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-ink)]">Blog Management</h2>
          <p className="text-xs text-[var(--text-muted)]">Published articles go live on /blog immediately.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="h-9 px-3 rounded-xl border border-[var(--border-line)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-ink)] inline-flex items-center gap-1.5">
            <RefreshCw className="size-3.5" /> Refresh
          </button>
          <button onClick={openNew} className="btn-accent h-9 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5">
            <Plus className="size-3.5" /> Write New Article
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl border border-[var(--border-line)] overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-[var(--text-muted)]">Loading articles…</p>
        ) : posts.length === 0 ? (
          <p className="p-6 text-sm text-[var(--text-muted)]">No articles yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--border-line)]">
            {posts.map((p) => (
              <li key={p.slug} className="p-4 flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-[var(--text-ink)] truncate">{p.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    /blog/{p.slug} · {p.category} · {p.date} · {p.readTime}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-semibold border ${p.status === 'published' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                  {p.status === 'published' ? 'Published' : 'Draft'}
                </span>
                {p.source === 'default' && (
                  <span title="Built into the site's code. Editing saves a copy that replaces it." className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold border border-[var(--border-line)] text-[var(--text-muted)]">
                    Built-in
                  </span>
                )}
                <div className="flex gap-1.5">
                  {p.status === 'published' && (
                    <Link href={`/blog/${p.slug}`} target="_blank" className="size-8 rounded-lg border border-[var(--border-line)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-ink)]" title="View">
                      <Eye className="size-3.5" />
                    </Link>
                  )}
                  <button onClick={() => openEdit(p)} className="size-8 rounded-lg border border-[var(--border-line)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--brand-mark)]" title="Edit">
                    <Edit className="size-3.5" />
                  </button>
                  {p.source === 'database' && (
                    <button onClick={() => remove(p)} className="size-8 rounded-lg border border-rose-500/20 flex items-center justify-center text-rose-400 hover:bg-rose-500/10" title="Delete">
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {form && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4" role="dialog" aria-modal="true" aria-label="Edit article">
          <form onSubmit={save} className="glass w-full max-w-5xl rounded-2xl border border-[var(--border-line)] p-5 sm:p-6 my-6 space-y-4 bg-[var(--bg-surface)]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--text-ink)]">{form.originalSlug ? 'Edit article' : 'Write new article'}</h3>
              <button type="button" onClick={() => setForm(null)} className="size-9 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-ink)]" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={label} htmlFor="post-title">Title <span className="normal-case font-normal">({form.title.length}/160)</span></label>
                <input id="post-title" required minLength={3} maxLength={160} value={form.title} onChange={(e) => set('title', e.target.value)} className={input} />
              </div>
              <div>
                <label className={label} htmlFor="post-slug">Slug</label>
                <input id="post-slug" value={form.slug} onChange={(e) => { setSlugTouched(true); set('slug', e.target.value); }} placeholder="from-the-title" className={`${input} font-mono`} />
              </div>
              <div>
                <label className={label} htmlFor="post-category">Category</label>
                <input id="post-category" maxLength={60} value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="Case Studies" className={input} />
              </div>
              <div>
                <label className={label}>Read time</label>
                <p className={`${input} flex items-center text-[var(--text-muted)]`}>{Math.max(1, Math.round(words(form.content) / 200))} min read · calculated from the content</p>
              </div>
              <div className="md:col-span-2">
                <label className={label} htmlFor="post-cover">Cover image URL</label>
                <input id="post-cover" type="url" value={form.coverImage} onChange={(e) => set('coverImage', e.target.value)} placeholder="https://…" className={input} />
              </div>
              <div className="md:col-span-2">
                <label className={label} htmlFor="post-excerpt">Excerpt <span className="normal-case font-normal">({form.excerpt.length}/300, shown in search results and the blog list)</span></label>
                <textarea id="post-excerpt" maxLength={300} rows={2} value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} className={`${input} h-auto py-2`} />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <label className={`${label} mb-0`} htmlFor="post-content">
                  Content (Markdown) <span className="normal-case font-normal">· {form.content.length.toLocaleString()} characters · {words(form.content).toLocaleString()} words</span>
                </label>
                <button type="button" onClick={() => setPreview((v) => !v)} className="text-xs font-semibold text-[var(--brand-mark)] hover:underline">
                  {preview ? 'Hide preview' : 'Show live preview'}
                </button>
              </div>
              <div className={`grid gap-4 ${preview ? 'lg:grid-cols-2' : ''}`}>
                <textarea
                  id="post-content"
                  required
                  minLength={50}
                  rows={20}
                  value={form.content}
                  onChange={(e) => set('content', e.target.value)}
                  placeholder={'## Heading\n\nWrite with **Markdown**: lists, [links](https://…), tables…'}
                  className={`${input} h-auto py-2 font-mono text-[12.5px] leading-relaxed`}
                />
                {preview && (
                  <div className="prose-post rounded-xl border border-[var(--border-line)] p-4 overflow-y-auto max-h-[520px] text-[14px] text-[var(--text-ink)]" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-line)]">
              <label className="flex items-center gap-2 text-sm text-[var(--text-ink)]">
                Status
                <select value={form.status} onChange={(e) => set('status', e.target.value)} className={`${input} w-auto`}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setForm(null)} className="h-10 px-4 rounded-xl border border-[var(--border-line)] text-xs font-semibold text-[var(--text-muted)]">Cancel</button>
                <button type="submit" disabled={saving} className="btn-accent h-10 px-5 rounded-xl text-xs font-bold disabled:opacity-50">
                  {saving ? 'Saving…' : form.status === 'published' ? 'Publish' : 'Save draft'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
