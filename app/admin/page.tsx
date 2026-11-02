'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Lock,
  Unlock,
  Layers,
  Users,
  Flame,
  Settings,
  Plus,
  Search,
  Trash2,
  Edit,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  DollarSign,
  Bot,
  User,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Channel, Niche } from '@/types';
import { formatNumber, formatCurrency } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'channels' | 'niches' | 'settings'>('dashboard');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Stats state
  const [stats, setStats] = useState({
    channelsCount: 7445,
    nichesCount: 2706,
    outliersCount: 20210,
    blogPostsCount: 4,
    status: 'healthy',
    canonicalUrl: 'https://ytniches.com/',
    siteName: 'YT Niches'
  });

  // Channel manager state
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelSearch, setChannelSearch] = useState('');
  const [channelPage, setChannelPage] = useState(1);
  const [channelTotal, setChannelTotal] = useState(0);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Partial<Channel> | null>(null);
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);

  // Niche manager state
  const [niches, setNiches] = useState<Niche[]>([]);
  const [nicheSearch, setNicheSearch] = useState('');
  const [nichePage, setNichePage] = useState(1);
  const [nicheTotal, setNicheTotal] = useState(0);
  const [loadingNiches, setLoadingNiches] = useState(false);
  const [editingNiche, setEditingNiche] = useState<Partial<Niche> | null>(null);
  const [isAddNicheOpen, setIsAddNicheOpen] = useState(false);

  // Check saved session
  useEffect(() => {
    const saved = localStorage.getItem('yt_admin_session');
    if (saved === 'authorized_2026') {
      setIsAuthenticated(true);
      fetchStats();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'ytniches2026' || passcode === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('yt_admin_session', 'authorized_2026');
      showToast('Welcome to YT Niches Admin Panel!', 'success');
      fetchStats();
    } else {
      showToast('Invalid passcode. Default is "ytniches2026"', 'error');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('yt_admin_session');
    setPasscode('');
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {}
  };

  // Fetch channels
  const loadChannels = async (search = channelSearch, page = channelPage) => {
    setLoadingChannels(true);
    try {
      const res = await fetch(`/api/admin/channels?search=${encodeURIComponent(search)}&page=${page}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setChannels(data.items || []);
        setChannelTotal(data.total || 0);
      }
    } catch (e) {
      showToast('Failed to load channels', 'error');
    } finally {
      setLoadingChannels(false);
    }
  };

  // Fetch niches
  const loadNiches = async (search = nicheSearch, page = nichePage) => {
    setLoadingNiches(true);
    try {
      const res = await fetch(`/api/admin/niches?search=${encodeURIComponent(search)}&page=${page}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setNiches(data.items || []);
        setNicheTotal(data.total || 0);
      }
    } catch (e) {
      showToast('Failed to load niches', 'error');
    } finally {
      setLoadingNiches(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'channels') loadChannels();
      if (activeTab === 'niches') loadNiches();
    }
  }, [isAuthenticated, activeTab]);

  // Save / Update Channel
  const handleSaveChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel?.title || !editingChannel?.handle) {
      showToast('Title and handle are required', 'error');
      return;
    }

    const isUpdate = Boolean(editingChannel.id && channels.some((c) => c.id === editingChannel.id));
    const method = isUpdate ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/admin/channels', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingChannel)
      });

      if (res.ok) {
        showToast(isUpdate ? 'Channel updated successfully' : 'New channel added', 'success');
        setEditingChannel(null);
        setIsAddChannelOpen(false);
        loadChannels();
        fetchStats();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save channel', 'error');
      }
    } catch (e) {
      showToast('Network error while saving channel', 'error');
    }
  };

  // Delete Channel
  const handleDeleteChannel = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/channels?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast(`Channel "${title}" deleted`, 'success');
        loadChannels();
        fetchStats();
      }
    } catch (e) {
      showToast('Failed to delete channel', 'error');
    }
  };

  // Save / Update Niche
  const handleSaveNiche = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNiche?.name) {
      showToast('Niche name is required', 'error');
      return;
    }

    const isUpdate = Boolean(editingNiche.slug && niches.some((n) => n.slug === editingNiche.slug));
    const method = isUpdate ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/admin/niches', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingNiche)
      });

      if (res.ok) {
        showToast(isUpdate ? 'Niche updated successfully' : 'New niche added', 'success');
        setEditingNiche(null);
        setIsAddNicheOpen(false);
        loadNiches();
        fetchStats();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save niche', 'error');
      }
    } catch (e) {
      showToast('Network error while saving niche', 'error');
    }
  };

  // Delete Niche
  const handleDeleteNiche = async (slug: string, name: string) => {
    if (!confirm(`Are you sure you want to delete niche "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/niches?slug=${encodeURIComponent(slug)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast(`Niche "${name}" deleted`, 'success');
        loadNiches();
        fetchStats();
      }
    } catch (e) {
      showToast('Failed to delete niche', 'error');
    }
  };

  // --- Render Login Gate if not authenticated ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="glass rounded-3xl p-8 sm:p-10 border border-[var(--border-line)] max-w-md w-full text-center shadow-2xl">
          <div className="size-14 rounded-2xl bg-[var(--brand-accent)]/10 text-[var(--brand-mark)] flex items-center justify-center mx-auto mb-5 border border-[var(--brand-accent)]/20 shadow-sm">
            <Lock className="size-6" />
          </div>

          <h1 className="text-2xl font-extrabold text-[var(--text-ink)] mb-2">
            YT Niches Admin Portal
          </h1>
          <p className="text-xs text-[var(--text-muted)] mb-6">
            Enter your secret administrative passcode to manage channels, programmatic niches, and platform settings.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode (default: ytniches2026)"
                className="w-full h-11 px-4 text-center tracking-widest text-sm rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-mark)]"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn-accent w-full h-11 rounded-xl text-xs font-bold shadow-md hover:scale-[1.02] transition-transform"
            >
              Unlock Administration &rarr;
            </button>
          </form>

          {toast && (
            <div className={`mt-4 p-2.5 text-xs rounded-lg ${toast.type === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {toast.msg}
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-[var(--border-line)]">
            <Link href="/" className="text-xs text-[var(--text-muted)] hover:text-[var(--brand-mark)]">
              &larr; Return to Public Platform
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Render Authenticated Dashboard ---
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border ${
          toast.type === 'success'
            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
            : 'bg-rose-950 text-rose-300 border-rose-500/50'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="size-4 text-emerald-400" /> : <AlertCircle className="size-4 text-rose-400" />}
          {toast.msg}
        </div>
      )}

      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[var(--border-line)] gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--brand-accent)]/10 text-[var(--brand-mark)] border border-[var(--brand-accent)]/20 mb-1.5">
            <Shield className="size-3.5" /> Management Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-ink)] tracking-tight">
            YT Niches Administration
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="h-9 px-3.5 rounded-xl glass border border-[var(--border-line)] text-xs font-semibold text-[var(--text-ink)] inline-flex items-center gap-1.5 hover:bg-[var(--bg-surface-2)]"
          >
            Live Site <ExternalLink className="size-3" />
          </Link>
          <button
            onClick={handleLogout}
            className="h-9 px-3.5 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <Lock className="size-3" /> Lock Admin
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-line)] mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
            activeTab === 'dashboard'
              ? 'bg-[var(--brand-accent)] text-white shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--bg-surface-2)]'
          }`}
        >
          <TrendingUp className="size-3.5" /> Dashboard &amp; KPIs
        </button>
        <button
          onClick={() => setActiveTab('channels')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
            activeTab === 'channels'
              ? 'bg-[var(--brand-accent)] text-white shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--bg-surface-2)]'
          }`}
        >
          <Users className="size-3.5" /> Channel Manager ({stats.channelsCount.toLocaleString()})
        </button>
        <button
          onClick={() => setActiveTab('niches')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
            activeTab === 'niches'
              ? 'bg-[var(--brand-accent)] text-white shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--bg-surface-2)]'
          }`}
        >
          <Layers className="size-3.5" /> Niche Manager ({stats.nichesCount.toLocaleString()})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-[var(--brand-accent)] text-white shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--bg-surface-2)]'
          }`}
        >
          <Settings className="size-3.5" /> Site Settings &amp; SEO
        </button>
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass rounded-2xl p-5 border border-[var(--border-line)]">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
                <span>Total Channels</span>
                <Users className="size-4 text-[var(--brand-mark)]" />
              </div>
              <div className="text-3xl font-extrabold num-mono text-[var(--text-ink)]">
                {stats.channelsCount.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-500 font-semibold mt-1">
                ✓ 7,400+ Active Indexed
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-[var(--border-line)]">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
                <span>Programmatic Niches</span>
                <Layers className="size-4 text-purple-400" />
              </div>
              <div className="text-3xl font-extrabold num-mono text-[var(--text-ink)]">
                {stats.nichesCount.toLocaleString()}
              </div>
              <div className="text-[11px] text-purple-400 font-semibold mt-1">
                ✓ Auto-Calculated RPMs
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-[var(--border-line)]">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
                <span>Viral Outliers</span>
                <Flame className="size-4 text-amber-500" />
              </div>
              <div className="text-3xl font-extrabold num-mono text-amber-500">
                {stats.outliersCount.toLocaleString()}
              </div>
              <div className="text-[11px] text-amber-500 font-semibold mt-1">
                ✓ 5x to 50x Multipliers
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-[var(--border-line)]">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
                <span>Blog Articles</span>
                <Shield className="size-4 text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold num-mono text-[var(--text-ink)]">
                {stats.blogPostsCount}
              </div>
              <div className="text-[11px] text-blue-400 font-semibold mt-1">
                ✓ High Authority SEO
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-2xl p-6 border border-[var(--border-line)]">
            <h3 className="font-bold text-base text-[var(--text-ink)] mb-4">
              Quick Administrative Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setEditingChannel({ format: 'faceless', monetization: true, subscribers: 10000 });
                  setIsAddChannelOpen(true);
                  setActiveTab('channels');
                }}
                className="p-4 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] hover:border-[var(--brand-mark)] text-left transition-all group"
              >
                <div className="size-8 rounded-lg bg-[var(--brand-accent)]/10 text-[var(--brand-mark)] flex items-center justify-center mb-2">
                  <Plus className="size-4" />
                </div>
                <div className="font-bold text-sm text-[var(--text-ink)] group-hover:text-[var(--brand-mark)]">
                  Add New Channel
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Insert a new YouTube creator, handle, and subscriber stats.
                </p>
              </button>

              <button
                onClick={() => {
                  setEditingNiche({ saturation: 'Low', demandScore: 8.5 });
                  setIsAddNicheOpen(true);
                  setActiveTab('niches');
                }}
                className="p-4 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] hover:border-[var(--brand-mark)] text-left transition-all group"
              >
                <div className="size-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2">
                  <Layers className="size-4" />
                </div>
                <div className="font-bold text-sm text-[var(--text-ink)] group-hover:text-purple-400">
                  Create New Niche
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Launch a new programmatic SEO niche landing page.
                </p>
              </button>

              <Link
                href="/outliers"
                className="p-4 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] hover:border-amber-500 text-left transition-all group block"
              >
                <div className="size-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
                  <Flame className="size-4" />
                </div>
                <div className="font-bold text-sm text-[var(--text-ink)] group-hover:text-amber-500">
                  Inspect Outliers
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Browse 20,000+ breakout videos sorted by multiplier.
                </p>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CHANNEL MANAGER */}
      {activeTab === 'channels' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={channelSearch}
                onChange={(e) => {
                  setChannelSearch(e.target.value);
                  loadChannels(e.target.value, 1);
                }}
                placeholder="Search channel name, handle, or category..."
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-xs text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-mark)]"
              />
            </div>

            <button
              onClick={() => {
                setEditingChannel({ format: 'faceless', monetization: true, subscribers: 10000 });
                setIsAddChannelOpen(true);
              }}
              className="btn-accent h-10 px-5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="size-4" /> Add Channel
            </button>
          </div>

          {/* Channels Table */}
          <div className="glass rounded-2xl border border-[var(--border-line)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-line)] bg-[var(--bg-surface-2)]/60 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-3">Format</th>
                    <th className="py-3 px-3">Subscribers</th>
                    <th className="py-3 px-3">Avg Views</th>
                    <th className="py-3 px-3">Est. RPM</th>
                    <th className="py-3 px-3">Monetization</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingChannels ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[var(--text-muted)]">
                        Loading channels...
                      </td>
                    </tr>
                  ) : channels.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[var(--text-muted)]">
                        No channels found matching search.
                      </td>
                    </tr>
                  ) : (
                    channels.map((c) => (
                      <tr key={c.id || c.handle} className="border-b border-[var(--border-line)] hover:bg-[var(--bg-surface-2)]/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={c.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=60'}
                              alt={c.title}
                              className="size-8 rounded-lg object-cover border border-[var(--border-line)] shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-[var(--text-ink)] truncate max-w-[180px]">{c.title}</div>
                              <div className="text-[11px] text-[var(--text-muted)]">{c.handle}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {c.format === 'avatar' || c.avatarStyle ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              Avatar
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              Faceless
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 num-mono font-bold text-[var(--text-ink)]">
                          {formatNumber(c.subscribers)}
                        </td>
                        <td className="py-3 px-3 num-mono text-[var(--text-muted)]">
                          {formatNumber(c.avgViews || 0)}
                        </td>
                        <td className="py-3 px-3 num-mono font-semibold text-emerald-500">
                          ${c.estimatedRpm?.avg || 8.5}
                        </td>
                        <td className="py-3 px-3">
                          {c.monetization ? (
                            <span className="text-emerald-500 font-semibold inline-flex items-center gap-1">
                              <CheckCircle2 className="size-3" /> Yes
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">No</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingChannel({ ...c });
                                setIsAddChannelOpen(true);
                              }}
                              className="size-7 rounded-lg bg-[var(--bg-surface-2)] text-[var(--text-muted)] hover:text-[var(--text-ink)] flex items-center justify-center transition-colors"
                              title="Edit Channel"
                            >
                              <Edit className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteChannel(c.id || c.handle, c.title)}
                              className="size-7 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 flex items-center justify-center transition-colors"
                              title="Delete Channel"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-[var(--border-line)] flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Showing {channels.length} of {channelTotal.toLocaleString()} channels</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={channelPage <= 1}
                  onClick={() => {
                    const p = channelPage - 1;
                    setChannelPage(p);
                    loadChannels(channelSearch, p);
                  }}
                  className="px-3 py-1 rounded-lg border border-[var(--border-line)] disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="font-mono">{channelPage}</span>
                <button
                  disabled={channels.length < 20}
                  onClick={() => {
                    const p = channelPage + 1;
                    setChannelPage(p);
                    loadChannels(channelSearch, p);
                  }}
                  className="px-3 py-1 rounded-lg border border-[var(--border-line)] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NICHE MANAGER */}
      {activeTab === 'niches' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={nicheSearch}
                onChange={(e) => {
                  setNicheSearch(e.target.value);
                  loadNiches(e.target.value, 1);
                }}
                placeholder="Search niches by name or slug..."
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-xs text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-mark)]"
              />
            </div>

            <button
              onClick={() => {
                setEditingNiche({ saturation: 'Low', demandScore: 8.5 });
                setIsAddNicheOpen(true);
              }}
              className="btn-accent h-10 px-5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="size-4" /> Add Niche
            </button>
          </div>

          {/* Niches Table */}
          <div className="glass rounded-2xl border border-[var(--border-line)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-line)] bg-[var(--bg-surface-2)]/60 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    <th className="py-3 px-4">Niche Name</th>
                    <th className="py-3 px-3">Slug</th>
                    <th className="py-3 px-3">Channels</th>
                    <th className="py-3 px-3">Avg Views</th>
                    <th className="py-3 px-3">Benchmark RPM</th>
                    <th className="py-3 px-3">Saturation</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingNiches ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[var(--text-muted)]">
                        Loading niches...
                      </td>
                    </tr>
                  ) : niches.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[var(--text-muted)]">
                        No niches found.
                      </td>
                    </tr>
                  ) : (
                    niches.map((n) => (
                      <tr key={n.slug} className="border-b border-[var(--border-line)] hover:bg-[var(--bg-surface-2)]/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-[var(--text-ink)]">
                          <Link href={`/niche/${n.slug}`} target="_blank" className="hover:text-[var(--brand-mark)]">
                            {n.name}
                          </Link>
                        </td>
                        <td className="py-3 px-3 font-mono text-[var(--text-muted)]">
                          /niche/{n.slug}
                        </td>
                        <td className="py-3 px-3 num-mono text-[var(--text-ink)] font-semibold">
                          {n.channelCount}
                        </td>
                        <td className="py-3 px-3 num-mono text-[var(--text-muted)]">
                          {formatNumber(n.avgViews)}
                        </td>
                        <td className="py-3 px-3 num-mono font-bold text-emerald-500">
                          ${n.rpm?.avg?.toFixed(2) || '8.50'}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            n.saturation === 'Low'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : n.saturation === 'Medium'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {n.saturation}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingNiche({ ...n });
                                setIsAddNicheOpen(true);
                              }}
                              className="size-7 rounded-lg bg-[var(--bg-surface-2)] text-[var(--text-muted)] hover:text-[var(--text-ink)] flex items-center justify-center transition-colors"
                              title="Edit Niche"
                            >
                              <Edit className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteNiche(n.slug, n.name)}
                              className="size-7 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 flex items-center justify-center transition-colors"
                              title="Delete Niche"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-[var(--border-line)] flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Showing {niches.length} of {nicheTotal.toLocaleString()} niches</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={nichePage <= 1}
                  onClick={() => {
                    const p = nichePage - 1;
                    setNichePage(p);
                    loadNiches(nicheSearch, p);
                  }}
                  className="px-3 py-1 rounded-lg border border-[var(--border-line)] disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="font-mono">{nichePage}</span>
                <button
                  disabled={niches.length < 20}
                  onClick={() => {
                    const p = nichePage + 1;
                    setNichePage(p);
                    loadNiches(nicheSearch, p);
                  }}
                  className="px-3 py-1 rounded-lg border border-[var(--border-line)] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS & SEO */}
      {activeTab === 'settings' && (
        <div className="glass rounded-2xl p-6 sm:p-8 border border-[var(--border-line)] space-y-6 max-w-2xl">
          <h2 className="text-lg font-bold text-[var(--text-ink)] pb-3 border-b border-[var(--border-line)]">
            Platform &amp; SEO Configuration
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[var(--text-muted)] font-semibold mb-1">Platform Brand Name</label>
              <input
                type="text"
                readOnly
                value="YT Niches"
                className="w-full h-10 px-3 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] font-bold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[var(--text-muted)] font-semibold mb-1">Strict Canonical Base URL</label>
              <input
                type="text"
                readOnly
                value="https://ytniches.com/"
                className="w-full h-10 px-3 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] font-mono cursor-not-allowed"
              />
            </div>

            <div className="pt-4 border-t border-[var(--border-line)]">
              <h3 className="font-bold text-sm text-[var(--text-ink)] mb-1">Google OAuth &amp; Supabase Integration</h3>
              <p className="text-[var(--text-muted)] mb-3">
                To activate live 1-click Google sign-in on gated channel analytics, provide your Supabase project keys in <code className="px-1.5 py-0.5 rounded bg-[var(--bg-surface-2)]">.env.local</code>.
              </p>
              <div className="p-3 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] font-mono text-[11px] text-[var(--text-muted)] space-y-1">
                <div>NEXT_PUBLIC_SUPABASE_URL=your_supabase_url</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CHANNEL */}
      {isAddChannelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="glass rounded-3xl p-6 sm:p-8 border border-[var(--border-line)] max-w-lg w-full my-8 shadow-2xl">
            <h3 className="text-lg font-bold text-[var(--text-ink)] mb-4">
              {editingChannel?.id ? 'Edit YouTube Channel' : 'Add New YouTube Channel'}
            </h3>

            <form onSubmit={handleSaveChannel} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">Channel Title</label>
                <input
                  type="text"
                  required
                  value={editingChannel?.title || ''}
                  onChange={(e) => setEditingChannel({ ...editingChannel, title: e.target.value })}
                  placeholder="e.g. The Crystalier"
                  className="w-full h-9 px-3 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">Channel Handle</label>
                <input
                  type="text"
                  required
                  value={editingChannel?.handle || ''}
                  onChange={(e) => setEditingChannel({ ...editingChannel, handle: e.target.value })}
                  placeholder="e.g. @thecrystalier"
                  className="w-full h-9 px-3 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] font-semibold mb-1">Subscribers Count</label>
                  <input
                    type="number"
                    value={editingChannel?.subscribers || 0}
                    onChange={(e) => setEditingChannel({ ...editingChannel, subscribers: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] num-mono"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-muted)] font-semibold mb-1">Average Views/Video</label>
                  <input
                    type="number"
                    value={editingChannel?.avgViews || 0}
                    onChange={(e) => setEditingChannel({ ...editingChannel, avgViews: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] num-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] font-semibold mb-1">Format</label>
                  <select
                    value={editingChannel?.format || 'faceless'}
                    onChange={(e) => setEditingChannel({ ...editingChannel, format: e.target.value as any })}
                    className="w-full h-9 px-3 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)]"
                  >
                    <option value="avatar">AI Avatar</option>
                    <option value="faceless">Faceless Voiceover</option>
                    <option value="documentary">Documentary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--text-muted)] font-semibold mb-1">Est. Monthly Revenue ($)</label>
                  <input
                    type="number"
                    value={editingChannel?.estimatedMonthlyRevenueUsd || ''}
                    onChange={(e) => setEditingChannel({ ...editingChannel, estimatedMonthlyRevenueUsd: Number(e.target.value) })}
                    placeholder="e.g. 4500"
                    className="w-full h-9 px-3 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] num-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="monetizationToggle"
                  checked={Boolean(editingChannel?.monetization)}
                  onChange={(e) => setEditingChannel({ ...editingChannel, monetization: e.target.checked })}
                  className="size-4 rounded accent-[var(--brand-mark)]"
                />
                <label htmlFor="monetizationToggle" className="text-xs font-semibold text-[var(--text-ink)]">
                  Channel is Monetized with YouTube AdSense
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-line)]">
                <button
                  type="button"
                  onClick={() => setIsAddChannelOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-line)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-ink)]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-accent px-5 py-2 rounded-xl text-xs font-bold shadow-sm">
                  Save Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT NICHE */}
      {isAddNicheOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="glass rounded-3xl p-6 sm:p-8 border border-[var(--border-line)] max-w-lg w-full my-8 shadow-2xl">
            <h3 className="text-lg font-bold text-[var(--text-ink)] mb-4">
              {editingNiche?.slug ? 'Edit Niche Blueprint' : 'Create New Niche'}
            </h3>

            <form onSubmit={handleSaveNiche} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">Niche Name</label>
                <input
                  type="text"
                  required
                  value={editingNiche?.name || ''}
                  onChange={(e) => setEditingNiche({ ...editingNiche, name: e.target.value })}
                  placeholder="e.g. Faceless Roman History"
                  className="w-full h-9 px-3 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] font-bold"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">URL Slug</label>
                <input
                  type="text"
                  value={editingNiche?.slug || ''}
                  onChange={(e) => setEditingNiche({ ...editingNiche, slug: e.target.value })}
                  placeholder="e.g. faceless-roman-history"
                  className="w-full h-9 px-3 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] font-semibold mb-1">Avg Benchmark RPM ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingNiche?.rpm?.avg || ''}
                    onChange={(e) => setEditingNiche({
                      ...editingNiche,
                      rpm: { min: (editingNiche?.rpm?.min || 6), avg: Number(e.target.value), max: (editingNiche?.rpm?.max || 18) }
                    })}
                    placeholder="e.g. 14.5"
                    className="w-full h-9 px-3 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] num-mono"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] font-semibold mb-1">Competition Saturation</label>
                  <select
                    value={editingNiche?.saturation || 'Medium'}
                    onChange={(e) => setEditingNiche({ ...editingNiche, saturation: e.target.value as any })}
                    className="w-full h-9 px-3 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)]"
                  >
                    <option value="Low">Low Competition</option>
                    <option value="Medium">Medium Competition</option>
                    <option value="High">High Competition</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-line)]">
                <button
                  type="button"
                  onClick={() => setIsAddNicheOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-line)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-ink)]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-accent px-5 py-2 rounded-xl text-xs font-bold shadow-sm">
                  Save Niche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
