'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { FileSignature, Download, PenLine, Sparkles, FileText, Share2, Loader2, AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

interface Proposal {
  id: string;
  applicationReference: string;
  grantName: string;
  organization: string;
  proposalText: string | null;
  hasLetter: boolean;
  matchScore?: number;
  summary: string;
  createdAt: string;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function downloadAsText(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ProposalsPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchProposals = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/farmer/proposals/${user.id}`);
      if (!res.ok) throw new Error('fetch_failed');
      const data = await res.json();
      setProposals(data.proposals || []);
    } catch {
      setError("We couldn't load your proposals right now. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchProposals(); }, [fetchProposals]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--primary)' }}>
            <FileSignature size={22} />
            <h1 className="text-2xl font-bold tracking-tight">Proposal Drafts</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            AI-generated grant proposals from your discovery sessions. Download or share with grantors.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchProposals}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-muted"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
          <Link
            href="/farmer-portal"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, var(--primary), #22C55E)' }}
          >
            <Sparkles size={15} /> New Discovery
          </Link>
        </div>
      </header>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ backgroundColor: 'var(--tint-red)', borderColor: 'rgba(220,38,38,0.2)' }}>
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="py-16 flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading your proposals…</p>
        </div>
      ) : proposals.length === 0 ? (
        <div className="card-elevated py-16 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--tint-green)' }}>
            <Inbox size={28} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <p className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>No proposals generated yet</p>
            <p className="text-sm mt-1 max-w-sm" style={{ color: 'var(--muted-foreground)' }}>
              Run a grant discovery in the Farmer Portal. When the AI finds matches, it will automatically generate a grant proposal letter for you here.
            </p>
          </div>
          <Link href="/farmer-portal" className="btn-primary mt-2">
            Start Grant Discovery
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {proposals.map(prop => {
            const isOpen = expanded === prop.id;
            const date = prop.createdAt ? new Date(prop.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
            const filename = `${prop.grantName.replace(/[^a-zA-Z0-9]/g, '_')}_Proposal.txt`;

            return (
              <div key={prop.id} className="card-elevated relative overflow-hidden p-0">
                {/* Progress line at top */}
                <div className="h-1 w-full" style={{ backgroundColor: 'var(--tint-green)' }}>
                  <div className="h-full" style={{ width: prop.hasLetter ? '100%' : '40%', backgroundColor: 'var(--primary)', transition: 'width 0.5s ease' }} />
                </div>

                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex gap-4 items-start flex-1 min-w-0">
                      <div className="p-2.5 rounded-lg flex-shrink-0" style={{ backgroundColor: 'var(--tint-green)' }}>
                        <FileText size={20} style={{ color: 'var(--primary)' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{prop.grantName}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{prop.organization} · {date}</p>
                        {prop.summary && <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>{prop.summary}</p>}
                      </div>
                    </div>
                    <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${prop.hasLetter ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'}`}>
                      {prop.hasLetter ? 'Letter Ready' : 'Summary Only'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    {prop.hasLetter && (
                      <button
                        onClick={() => setExpanded(isOpen ? null : prop.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
                        style={{ color: 'var(--foreground)', border: '1px solid var(--border)' }}
                      >
                        <PenLine size={15} /> {isOpen ? 'Collapse' : 'Read Letter'}
                      </button>
                    )}
                    {prop.hasLetter && (
                      <button
                        onClick={() => downloadAsText(prop.proposalText!, filename)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{ backgroundColor: 'var(--tint-green)', color: 'var(--primary)' }}
                      >
                        <Download size={15} /> Download
                      </button>
                    )}
                    {prop.hasLetter && (
                      <button
                        onClick={() => copyToClipboard(prop.proposalText!)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
                        title="Copy to clipboard"
                      >
                        <Share2 size={16} />
                      </button>
                    )}
                    {!prop.hasLetter && (
                      <Link href="/farmer-portal" className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--primary)' }}>
                        <Sparkles size={15} /> Re-run Discovery
                      </Link>
                    )}
                  </div>

                  {isOpen && prop.proposalText && (
                    <div className="mt-4 p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap font-mono border" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)', maxHeight: '400px', overflowY: 'auto' }}>
                      {prop.proposalText}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
