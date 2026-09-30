'use client';

import React, { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { ApiKeyItem } from '@/types/schedule';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  User,
  Shield,
  Code2,
  Terminal,
  LogOut,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // User Profile
  const [userName, setUserName] = useState('Darren');
  const [userEmail, setUserEmail] = useState('darren@student.ac.id');
  const [userAvatar, setUserAvatar] = useState<string | undefined>();

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Newly generated plaintext key popup
  const [generatedPlaintextKey, setGeneratedPlaintextKey] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Load User profile
  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const name =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'Darren';
          setUserName(name);
          setUserEmail(user.email || 'user@example.com');
          setUserAvatar(user.user_metadata?.avatar_url || user.user_metadata?.picture);
        }
      } catch {
        // Dev fallback
      }
    }
    loadUser();
  }, []);

  // Fetch API Keys
  const loadApiKeys = async () => {
    setIsLoadingKeys(true);
    try {
      const res = await fetch('/api/keys');
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data.keys || []);
      }
    } catch (err) {
      console.error('Failed to load API keys:', err);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  useEffect(() => {
    loadApiKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.key) {
        setGeneratedPlaintextKey(data.key);
        setIsCreateKeyModalOpen(false);
        setNewKeyName('');
        loadApiKeys();
      }
    } catch (err) {
      console.error('Failed to create key:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? External automations using it will stop working immediately.')) {
      return;
    }

    try {
      const res = await fetch(`/api/keys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadApiKeys();
      }
    } catch (err) {
      console.error('Error revoking key:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignored
    } finally {
      document.cookie = 'd2d_session=; path=/; max-age=0';
      router.push('/auth/login');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-black text-zinc-800 dark:text-zinc-100 flex flex-col transition-colors duration-300">
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col flex-1">
        <AppNavbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          userName={userName}
          userEmail={userEmail}
          userAvatar={userAvatar}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Settings & Developer Access
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Manage your Google account profile and machine-to-machine API keys
            </p>
          </div>

          {/* 1. Account Section */}
          <section className="p-6 rounded-2xl bg-white/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-md space-y-6 transition-colors duration-300">
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800/50">
              <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-[#1E3A8A]/25 border border-blue-200 dark:border-[#1E3A8A]/60 text-[#3B82F6] flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100">
                  Account Information
                </h3>
                <p className="text-xs text-zinc-500">
                  Authenticated via Supabase Google OAuth
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-14 h-14 rounded-2xl border border-indigo-500/30 object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1E3A8A] to-[#1D4ED8] flex items-center justify-center text-white text-xl font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-base font-bold text-zinc-800 dark:text-zinc-100">{userName}</div>
                  <div className="text-xs text-zinc-500">{userEmail}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Row Level Security (RLS) Active</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium transition-colors duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Day2Day</span>
                </button>
              </div>
            </div>
          </section>

          {/* 2. Developer / API Keys Section */}
          <section className="p-6 rounded-2xl bg-white/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-md space-y-6 transition-colors duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-[#3B82F6] flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100">
                    Developer API Keys
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Use Bearer tokens to connect Python scripts or AI agents
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCreateKeyModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white text-xs font-medium shadow-xl shadow-blue-900/20 active:scale-95 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                <span>Create API Key</span>
              </button>
            </div>

            {/* List of keys */}
            <div className="space-y-3">
              {isLoadingKeys ? (
                <div className="p-8 text-center text-xs text-zinc-400 dark:text-zinc-600 animate-pulse">
                  Loading API keys...
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-8 rounded-2xl bg-zinc-50 dark:bg-gray-950/40 border border-zinc-200 dark:border-zinc-800/50 text-zinc-500 text-xs">
                  No API keys generated yet. Click &quot;Create API Key&quot; to authorize an AI agent or script.
                </div>
              ) : (
                apiKeys.map((k) => (
                  <div
                    key={k.id}
                    className="p-4 rounded-2xl bg-zinc-50 dark:bg-gray-950/60 border border-zinc-200 dark:border-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                          {k.name}
                        </span>
                        {k.revoked_at ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 font-medium">
                            Revoked
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 mt-1 font-mono">
                        <span>Prefix: {k.key_prefix}...</span>
                        <span>•</span>
                        <span>Created: {new Date(k.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>
                          Last used:{' '}
                          {k.last_used_at
                            ? new Date(k.last_used_at).toLocaleDateString()
                            : 'Never'}
                        </span>
                      </div>
                    </div>

                    {!k.revoked_at && (
                      <button
                        onClick={() => handleRevokeKey(k.id)}
                        className="self-end sm:self-center p-2 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors text-xs font-medium inline-flex items-center gap-1.5 duration-300"
                        title="Revoke key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Revoke</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Quick Automation Snippet */}
            <div className="mt-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/50 space-y-2 transition-colors duration-300">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-medium text-zinc-500 dark:text-zinc-400">
                <Terminal className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Quick Automation Example (cURL)</span>
              </div>
              <pre className="p-3 rounded-2xl bg-zinc-900 dark:bg-black border border-zinc-700 dark:border-zinc-800/50 text-[11px] font-mono text-cyan-300 overflow-x-auto">
{`curl -X GET "http://localhost:3000/api/schedules/today" \\ -H "Authorization: Bearer d2d_live_YOUR_KEY_HERE"`}
              </pre>
            </div>
          </section>
        </main>
      </div>

      {/* Modal: Create API Key Name */}
      {isCreateKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-medium text-zinc-900 dark:text-white tracking-tight">Create New API Key</h3>
            <p className="text-[11px] uppercase tracking-widest font-medium text-zinc-500 mt-1">
              Give this key a descriptive name (e.g. &quot;Telegram Bot&quot; or &quot;Python AI Agent&quot;).
            </p>

            <form onSubmit={handleCreateKey} className="mt-6 space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Key Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My College AI Assistant"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-[#1E3A8A] transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateKeyModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-2.5 rounded-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white text-xs font-medium shadow-xl shadow-blue-900/20 active:scale-95 transition-all duration-300 disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Generate Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Plaintext Key Display (Shown Only Once!) */}
      {generatedPlaintextKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-blue-200 dark:border-[#1E3A8A]/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-[#1E3A8A]/25 border border-blue-200 dark:border-[#1E3A8A]/60 text-[#3B82F6] flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white tracking-tight">
                Save Your API Key
              </h3>
              <p className="text-[11px] uppercase tracking-widest font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                Please copy your API key now. For security purposes,{' '}
                <strong className="text-amber-600 dark:text-amber-400">it will never be displayed again.</strong>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900 dark:bg-black border border-zinc-700 dark:border-zinc-800/50 flex items-center justify-between gap-3">
              <code className="text-xs font-mono text-cyan-300 break-all select-all">
                {generatedPlaintextKey}
              </code>
              <button
                onClick={() => copyToClipboard(generatedPlaintextKey)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white text-[11px] font-medium uppercase tracking-widest flex-shrink-0 transition-colors duration-300 shadow-xl shadow-blue-900/20"
              >
                {hasCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500 dark:text-amber-400" />
              <span>
                Store this token securely in your environment variables. Do not commit it to GitHub.
              </span>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setGeneratedPlaintextKey(null)}
                className="px-6 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800/50 text-zinc-800 dark:text-white text-xs font-medium transition-colors duration-300"
              >
                I have copied my key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
