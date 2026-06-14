'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { ShieldCheck, CheckCircle2, Clock, XCircle, UploadCloud, ExternalLink, Loader2, AlertCircle, RefreshCw, Fingerprint, FileText, Banknote, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

interface VaultDoc {
  id: string;
  name: string;
  status: 'VERIFIED' | 'PENDING' | 'MISSING';
  url: string | null;
  weight: number;
}

interface VaultData {
  trustScore: number;
  documents: VaultDoc[];
  farmerName: string | null;
  hasBVN: boolean;
  hasExistingLoanDefault: boolean;
}

const docIcons: Record<string, React.ElementType> = {
  nin: Fingerprint,
  cac: FileText,
  bank: Banknote,
  land: MapPin,
};

function ScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#22C55E' : score >= 50 ? '#FBBF24' : '#F87171';

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" className="-rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="var(--muted)" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>{score}%</span>
        <span className="text-[10px] font-medium" style={{ color: 'var(--muted-foreground)' }}>Trust</span>
      </div>
    </div>
  );
}

export default function TrustVaultPage() {
  const { user } = useAuth();
  const [vault, setVault] = useState<VaultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'documents' | 'audit'>('documents');

  const fetchVault = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/farmer/vault/${user.id}`);
      if (!res.ok) throw new Error('fetch_failed');
      const data: VaultData = await res.json();
      setVault(data);
    } catch {
      setError("We couldn't load your verification documents. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchVault(); }, [fetchVault]);

  const missingCount = vault?.documents.filter(d => d.status === 'MISSING').length ?? 0;
  const trustScore = vault?.trustScore ?? 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--primary)' }}>
            <ShieldCheck size={22} />
            <h1 className="text-2xl font-bold tracking-tight">Trust Vault</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Your verification documents and trust score — shared automatically with grantors.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchVault}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-muted"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          {vault && (
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <ScoreRing score={vault.trustScore} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Trust Score</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  {missingCount > 0 ? `Upload ${missingCount} more doc${missingCount !== 1 ? 's' : ''} to improve` : 'All documents verified!'}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ backgroundColor: 'var(--tint-red)', borderColor: 'rgba(220,38,38,0.2)' }}>
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="card-elevated p-0 overflow-hidden">
        <div className="flex border-b px-6 pt-4" style={{ borderColor: 'var(--border)' }}>
          {(['documents', 'audit'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-3 px-1 mr-6 text-sm font-semibold border-b-2 transition-all capitalize"
              style={{
                marginBottom: '-1px',
                borderColor: activeTab === tab ? 'var(--primary)' : 'transparent',
                color: activeTab === tab ? 'var(--primary)' : 'var(--muted-foreground)',
              }}
            >
              {tab === 'documents' ? 'Verification Documents' : 'Audit Trail'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading your vault…</p>
            </div>
          ) : activeTab === 'documents' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(vault?.documents ?? []).map(doc => {
                const Icon = docIcons[doc.id] ?? FileText;
                const isVerified = doc.status === 'VERIFIED';
                const isPending = doc.status === 'PENDING';

                return (
                  <div key={doc.id} className="rounded-xl border p-5 hover:shadow-sm transition-all" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 rounded-lg" style={{ backgroundColor: isVerified ? 'var(--tint-green)' : isPending ? 'var(--tint-amber)' : 'var(--muted)' }}>
                        <Icon size={22} style={{ color: isVerified ? 'var(--primary)' : isPending ? 'var(--accent)' : 'var(--muted-foreground)' }} />
                      </div>
                      {isVerified && (
                        <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--tint-green)', color: 'var(--primary)' }}>
                          <CheckCircle2 size={11} /> Verified
                        </span>
                      )}
                      {isPending && (
                        <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--tint-amber)', color: 'var(--accent)' }}>
                          <Clock size={11} /> Reviewing
                        </span>
                      )}
                      {!isVerified && !isPending && (
                        <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                          <XCircle size={11} /> Missing
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--foreground)' }}>{doc.name}</h3>
                    <div className="flex items-center gap-1.5 mb-5">
                      <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'var(--muted)' }}>
                        <div className="h-full rounded-full" style={{ width: isVerified ? '100%' : '0%', backgroundColor: 'var(--primary)', transition: 'width 0.6s ease' }} />
                      </div>
                      <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{doc.weight}pts</span>
                    </div>

                    {doc.status === 'MISSING' ? (
                      <Link href="/farmer-portal" className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors" style={{ backgroundColor: 'var(--tint-green)', color: 'var(--primary)' }}>
                        <UploadCloud size={16} /> Upload via Portal
                      </Link>
                    ) : doc.url ? (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="w-full py-2.5 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-colors hover:bg-muted" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                        <ExternalLink size={15} /> View Secure Document
                      </a>
                    ) : (
                      <div className="py-2.5 rounded-xl text-center text-sm" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}>
                        Processing…
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>Verification Events</p>
                {vault?.documents.filter(d => d.status !== 'MISSING').length === 0 ? (
                  <p className="text-sm text-center py-6" style={{ color: 'var(--muted-foreground)' }}>No verification events yet. Upload a document to begin.</p>
                ) : (
                  vault?.documents.filter(d => d.status !== 'MISSING').map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                      <CheckCircle2 size={15} style={{ color: 'var(--primary)' }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{doc.name} — {doc.status === 'VERIFIED' ? 'Verified' : 'Under Review'}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Securely stored in encrypted cloud storage</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {vault?.hasBVN && (
                <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--tint-green)' }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--primary)' }} />
                  <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>BVN confirmed — +5 bonus trust points applied</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
