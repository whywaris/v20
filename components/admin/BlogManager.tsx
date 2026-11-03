'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Bold, Code, Edit, Eye, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Minus, Plus, Quote,
  RefreshCw, Search, Table, Trash2, Upload, X,
} from 'lucide-react';
import { renderArticle } from '@/lib/markdown';
import type { Post } from '@/lib/posts';

type Toast = (msg: string, type?: 'success' | 'error') => void;
type Form = {
  originalSlug: string | null;
  title: string; slug: string; category: string; coverImage: string; excerpt: string; content: string;
  status: 'published' | 'draft'; seoTitle: string; seoDescription: string; publishAt: string;
};

const EMPTY: Form = {
  originalSlug: null, title: '', slug: '', category: '', coverImage: '', excerpt: '', content: '',
  status: 'published', seoTitle: '', seoDescription: '', publishAt: '',
};
const input = 'w-full h-10 px-3 rounded-xl text-[13px] bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-mark)]';
const label = 'block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1';
const slugify = (s: string) => s.toLowerCase().trim().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const isFuture = (date: string | null | undefined) => !!date && Date.parse(date) > Date.now();
const isScheduled = (p: Post) => p.status === 'published' && isFuture(p.publishedAt);
// <input type="datetime-local"> wants local "YYYY-MM-DDTHH:mm".
const toLocalInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.url;
}

/** /admin/blog: list, write, edit, schedule and delete posts (stored in Supabase via /api/admin/posts). */
export default function BlogManager({ showToast }: { showToast: Toast }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [q, setQ] = useState('');
  const [form, setForm] = useState<Form | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);
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
  }, [reload]);
  const refresh = () => { setLoading(true); setReload((r) => r + 1); };

  const shown = useMemo(() => {
    const s = q.toLowerCase().trim();
    return s ? posts.filter((p) => `${p.title} ${p.category} ${p.slug}`.toLowerCase().includes(s)) : posts;
  }, [posts, q]);
  const categories = useMemo(() => [...new Set(posts.map((p) => p.category))].sort(), [posts]);

  const openNew = () => { setForm(EMPTY); setSlugTouched(false); setPreview(false); };
  const openEdit = (p: Post) => {
    setForm({
      originalSlug: p.slug, title: p.title, slug: p.slug, category: p.category, coverImage: p.coverImage, excerpt: p.excerpt,
      content: p.content, status: p.status, seoTitle: p.seoTitle, seoDescription: p.seoDescription, publishAt: toLocalInput(p.publishedAt),
    });
    setSlugTouched(true);
    setPreview(false);
  };
  const set = (k: keyof Form, v: string) =>
    setForm((f) => f && { ...f, [k]: v, ...(k === 'title' && !slugTouched ? { slug: slugify(v) } : {}) });

  /** Wrap the selection (or insert a placeholder) in the content textarea. */
  const wrap = (before: string, after = '', placeholder = 'text') => {
    const el = area.current;
    if (!el || !form) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const sel = value.slice(a, b) || placeholder;
    const next = value.slice(0, a) + before + sel + after + value.slice(b);
    set('content', next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + before.length, a + before.length + sel.length);
    });
  };
  /** Prefix every selected line (headings, lists, quotes). */
  const prefix = (p: string | ((i: number) => string)) => {
    const el = area.current;
    if (!el || !form) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const start = value.lastIndexOf('\n', a - 1) + 1;
    const lines = value.slice(start, b).split('\n').map((l, i) => (typeof p === 'string' ? p : p(i)) + l);
    set('content', value.slice(0, start) + lines.join('\n') + value.slice(b));
    requestAnimationFrame(() => el.focus());
  };
  const insert = (text: string) => wrap(text, '', '');

  const onPickImage = async (file: File | undefined, target: 'body' | 'cover') => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      if (target === 'cover') set('coverImage', url);
      else insert(`\n![${file.name.replace(/\.[^.]+$/, '')}](${url})\n`);
      showToast('Image uploaded');
    } catch (e) {
      showToast((e as Error).message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, publishAt: form.publishAt ? new Date(form.publishAt).toISOString() : '' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      const future = isFuture(form.publishAt);
      showToast(form.status === 'draft' ? 'Draft saved' : future ? 'Article scheduled' : 'Article published');
      setForm(null);
      refresh();
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
    if (res.ok) { showToast('Article deleted'); refresh(); }
    else showToast(data.error || 'Failed to delete', 'error');
  };

  const previewHtml = useMemo(() => (form && preview ? renderArticle(form.content || '*Nothing to preview yet.*').html : ''), [form, preview]);
  const scheduledFuture = isFuture(form?.publishAt);
  const tool = 'size-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-ink)]';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles…" className={`${input} pl-9`} />
        </div>
        <button onClick={refresh} className="h-10 px-3 rounded-xl border border-[var(--border-line)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-ink)] inline-flex items-center gap-1.5">
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
        <button onClick={openNew} className="btn-accent h-10 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5">
          <Plus className="size-3.5" /> Write new article
        </button>
      </div>

      <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] overflow-hidden">
        {loading && !posts.length ? (
          <p className="p-6 text-sm text-[var(--text-muted)]">Loading articles…</p>
        ) : shown.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-[var(--text-muted)]">{posts.length ? 'No articles match your search.' : 'No articles yet. Write your first one.'}</p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border-line)]">
            {shown.map((p) => {
              const sched = isScheduled(p);
              return (
                <li key={p.slug} className="p-4 flex flex-wrap items-center gap-3">
                  <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-surface-2)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.coverImage && <img src={p.coverImage} alt="" className="size-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-[var(--text-ink)] truncate">{p.title}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {p.category} · {sched ? `goes live ${new Date(p.publishedAt!).toLocaleString()}` : p.date} · {p.readTime}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-semibold border ${
                    p.status === 'draft' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : sched ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'}`}>
                    {p.status === 'draft' ? 'Draft' : sched ? 'Scheduled' : 'Published'}
                  </span>
                  <div className="flex gap-1.5">
                    {p.status === 'published' && !sched && (
                      <Link href={`/blog/${p.slug}`} target="_blank" className="size-8 rounded-lg border border-[var(--border-line)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-ink)]" title="View on site">
                        <Eye className="size-3.5" />
                      </Link>
                    )}
                    <button onClick={() => openEdit(p)} className="size-8 rounded-lg border border-[var(--border-line)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--brand-mark)]" title="Edit">
                      <Edit className="size-3.5" />
                    </button>
                    <button onClick={() => remove(p)} className="size-8 rounded-lg border border-rose-500/20 flex items-center justify-center text-rose-500 hover:bg-rose-500/10" title="Delete">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {form && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-[var(--bg-canvas)]" role="dialog" aria-modal="true" aria-label="Edit article">
          <form onSubmit={save}>
            {/* Sticky top bar with the main actions */}
            <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-[var(--border-line)] bg-[var(--bg-surface)] px-4 py-3 sm:px-6">
              <button type="button" onClick={() => setForm(null)} className="size-9 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-ink)]" aria-label="Close editor">
                <X className="size-5" />
              </button>
              <span className="text-sm font-bold text-[var(--text-ink)]">{form.originalSlug ? 'Edit article' : 'New article'}</span>
              <span className="hidden text-xs text-[var(--text-muted)] sm:inline">· {words(form.content).toLocaleString()} words · {Math.max(1, Math.round(words(form.content) / 200))} min read</span>
              <div className="ml-auto flex items-center gap-2">
                <button type="button" onClick={() => setPreview((v) => !v)} className="h-9 px-3 rounded-xl border border-[var(--border-line)] text-xs font-semibold text-[var(--text-ink)] inline-flex items-center gap-1.5">
                  <Eye className="size-3.5" /> {preview ? 'Hide preview' : 'Preview'}
                </button>
                <select value={form.status} onChange={(e) => set('status', e.target.value)} className={`${input} h-9 w-auto`} aria-label="Status">
                  <option value="published">Publish</option>
                  <option value="draft">Draft</option>
                </select>
                <button type="submit" disabled={saving || uploading} className="btn-accent h-9 px-4 rounded-xl text-xs font-bold disabled:opacity-50">
                  {saving ? 'Saving…' : form.status === 'draft' ? 'Save draft' : scheduledFuture ? 'Schedule' : 'Publish'}
                </button>
              </div>
            </div>

            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px]">
              {/* Main column: title, content */}
              <div className="min-w-0 space-y-4">
                <input
                  required minLength={3} maxLength={160} value={form.title} onChange={(e) => set('title', e.target.value)}
                  placeholder="Article title" aria-label="Title"
                  className="w-full bg-transparent text-3xl font-bold tracking-tight text-[var(--text-ink)] placeholder:text-[var(--text-muted)] focus:outline-none"
                />
                <textarea
                  maxLength={300} rows={2} value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)}
                  placeholder="Short summary shown under the title and in the blog list (max 300 characters)" aria-label="Excerpt"
                  className="w-full resize-none bg-transparent text-[16px] text-[var(--text-muted)] placeholder:text-[var(--text-muted)]/60 focus:outline-none"
                />

                <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)]">
                  <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--border-line)] p-1.5">
                    <button type="button" className={tool} title="Heading" onClick={() => prefix('## ')}><Heading2 className="size-4" /></button>
                    <button type="button" className={tool} title="Subheading" onClick={() => prefix('### ')}><Heading3 className="size-4" /></button>
                    <button type="button" className={tool} title="Bold" onClick={() => wrap('**', '**')}><Bold className="size-4" /></button>
                    <button type="button" className={tool} title="Italic" onClick={() => wrap('*', '*')}><Italic className="size-4" /></button>
                    <button type="button" className={tool} title="Link" onClick={() => wrap('[', '](https://)', 'link text')}><Link2 className="size-4" /></button>
                    <button type="button" className={tool} title="Bullet list" onClick={() => prefix('- ')}><List className="size-4" /></button>
                    <button type="button" className={tool} title="Numbered list" onClick={() => prefix((i) => `${i + 1}. `)}><ListOrdered className="size-4" /></button>
                    <button type="button" className={tool} title="Quote" onClick={() => prefix('> ')}><Quote className="size-4" /></button>
                    <button type="button" className={tool} title="Code" onClick={() => wrap('`', '`', 'code')}><Code className="size-4" /></button>
                    <button type="button" className={tool} title="Table" onClick={() => insert('\n| Column | Column |\n| --- | --- |\n| Value | Value |\n')}><Table className="size-4" /></button>
                    <button type="button" className={tool} title="Divider" onClick={() => insert('\n\n---\n\n')}><Minus className="size-4" /></button>
                    <label className={`${tool} cursor-pointer`} title="Upload image into the article">
                      <ImagePlus className="size-4" />
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => { onPickImage(e.target.files?.[0], 'body'); e.target.value = ''; }} />
                    </label>
                    {uploading && <span className="ml-2 text-xs text-[var(--text-muted)]">Uploading…</span>}
                    <span className="ml-auto pr-2 text-[11px] text-[var(--text-muted)]">Markdown</span>
                  </div>
                  <div className={`grid ${preview ? 'lg:grid-cols-2' : ''}`}>
                    <textarea
                      ref={area} required minLength={50} value={form.content} onChange={(e) => set('content', e.target.value)}
                      placeholder={'## First section\n\nWrite here. Use the toolbar for headings, lists, links and images.'}
                      aria-label="Content"
                      className="min-h-[60vh] w-full resize-y bg-transparent p-4 font-mono text-[13.5px] leading-relaxed text-[var(--text-ink)] focus:outline-none"
                    />
                    {preview && (
                      <div className="prose-post min-h-[60vh] overflow-y-auto border-t border-[var(--border-line)] p-4 text-[15px] text-[var(--text-ink)] lg:border-l lg:border-t-0" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                    )}
                  </div>
                </div>
              </div>

              {/* Side column: settings */}
              <div className="space-y-4">
                <section className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-4 space-y-3">
                  <h3 className="text-sm font-bold text-[var(--text-ink)]">Publishing</h3>
                  <div>
                    <label className={label} htmlFor="post-date">Publish date</label>
                    <input id="post-date" type="datetime-local" value={form.publishAt} onChange={(e) => set('publishAt', e.target.value)} className={input} />
                    <p className="mt-1 text-[11.5px] text-[var(--text-muted)]">
                      {scheduledFuture ? 'Scheduled: goes live automatically at this time.' : 'Leave empty to publish now. A future date schedules it.'}
                    </p>
                  </div>
                  <div>
                    <label className={label} htmlFor="post-category">Category</label>
                    <input id="post-category" list="post-categories" maxLength={60} value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="Guides" className={input} />
                    <datalist id="post-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
                  </div>
                  <div>
                    <label className={label} htmlFor="post-slug">URL slug</label>
                    <input id="post-slug" value={form.slug} onChange={(e) => { setSlugTouched(true); set('slug', e.target.value); }} placeholder="from-the-title" className={`${input} font-mono`} />
                    <p className="mt-1 truncate text-[11.5px] text-[var(--text-muted)]">/blog/{form.slug || slugify(form.title) || '…'}</p>
                  </div>
                </section>

                <section className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-4 space-y-3">
                  <h3 className="text-sm font-bold text-[var(--text-ink)]">Cover image</h3>
                  {form.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.coverImage} alt="" className="aspect-[16/9] w-full rounded-xl object-cover" />
                  )}
                  <div className="flex gap-2">
                    <label className="h-9 flex-1 cursor-pointer rounded-xl border border-[var(--border-line)] text-xs font-semibold text-[var(--text-ink)] inline-flex items-center justify-center gap-1.5 hover:border-[var(--brand-accent)]">
                      <Upload className="size-3.5" /> {form.coverImage ? 'Replace' : 'Upload'}
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => { onPickImage(e.target.files?.[0], 'cover'); e.target.value = ''; }} />
                    </label>
                    {form.coverImage && (
                      <button type="button" onClick={() => set('coverImage', '')} className="h-9 px-3 rounded-xl border border-[var(--border-line)] text-xs font-semibold text-[var(--text-muted)]">Remove</button>
                    )}
                  </div>
                  <input type="url" value={form.coverImage} onChange={(e) => set('coverImage', e.target.value)} placeholder="…or paste an image URL" aria-label="Cover image URL" className={input} />
                </section>

                <section className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-4 space-y-3">
                  <h3 className="text-sm font-bold text-[var(--text-ink)]">SEO</h3>
                  <div>
                    <label className={label} htmlFor="post-seo-title">SEO title <span className={`normal-case font-normal ${form.seoTitle.length > 60 ? 'text-amber-500' : ''}`}>({form.seoTitle.length}/60)</span></label>
                    <input id="post-seo-title" maxLength={70} value={form.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} placeholder={form.title || 'Defaults to the title'} className={input} />
                  </div>
                  <div>
                    <label className={label} htmlFor="post-seo-desc">Meta description <span className={`normal-case font-normal ${form.seoDescription.length > 155 ? 'text-amber-500' : ''}`}>({form.seoDescription.length}/155)</span></label>
                    <textarea id="post-seo-desc" maxLength={170} rows={3} value={form.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} placeholder={form.excerpt || 'Defaults to the excerpt'} className={`${input} h-auto py-2`} />
                  </div>
                  {/* Google result preview */}
                  <div className="rounded-xl border border-[var(--border-line)] bg-white p-3 text-left">
                    <div className="truncate text-[12px] text-[#202124]">ytniches.com › blog › {form.slug || slugify(form.title) || '…'}</div>
                    <div className="mt-0.5 line-clamp-1 text-[16px] text-[#1a0dab]">{form.seoTitle || form.title || 'Article title'}</div>
                    <div className="mt-0.5 line-clamp-2 text-[12.5px] text-[#4d5156]">{form.seoDescription || form.excerpt || 'The meta description appears here in Google results.'}</div>
                  </div>
                </section>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
