'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { FolderOpen, ArrowRight, Search, Calendar, Building2, AlertCircle, Loader2, RefreshCw, CheckCircle2, Clock, XCircle, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

interface Application {
  id: string;
  applicationReference: string;
  grantName: string;
  organization: string;
  status: string;
  statusRaw: string;
  matchScore?: number;
  fundingAmount?: string;
  createdAt: string;
  matchedGrantsCount: number;
}

function statusConfig(status: string) {
  switch (status) {
    case 'Completed':   return { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-900/20',  label: 'Completed' };
    case 'Processing':  return { icon: Zap,           color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20',    label: 'Processing' };
    case 'Failed':      return { icon: XCircle,        color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-900/20',      label: 'Failed' };
    case 'Disqualified':return { icon: AlertCircle,    color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-900/20',  label: 'Disqualified' };
    default:            return { icon: Clock,           color: 'text-muted-foreground',               bg: 'bg-muted',                          label: status };
  }
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/farmer/applications/${user.id}`);
      if (!res.ok) throw new Error('fetch_failed');
      const data = await res.json();
      setApplications(data.applications || []);
    } catch {
      setError("We couldn't load your applications right now. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--primary)' }}>
            <FolderOpen size={22} />
            <h1 className="text-2xl font-bold tracking-tight">My Applications</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Track every grant search and AI pipeline run you have submitted.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchApplications}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-muted"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
          <Link
            href="/farmer-portal"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Search size={15} /> Find New Grants
          </Link>
        </div>
      </header>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ backgroundColor: 'var(--tint-red)', borderColor: 'rgba(220,38,38,0.2)' }}>
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm" style={{ color: 'var(--foreground)' }}>{error}</p>
        </div>
      )}

      <div className="card-elevated overflow-hidden p-0">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading your applications…</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-4 text-center px-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--tint-green)' }}>
              <FolderOpen size={28} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <p className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>No applications yet</p>
              <p className="text-sm mt-1 max-w-xs" style={{ color: 'var(--muted-foreground)' }}>
                Head to the Farmer Portal to run your first AI grant discovery search.
              </p>
            </div>
            <Link href="/farmer-portal" className="btn-primary mt-2">
              Start Grant Discovery
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b" style={{ backgroundColor: 'var(--muted)' }}>
                  <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Grant / Ref</th>
                  <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Organization</th>
                  <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Status</th>
                  <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Grants Found</th>
                  <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Date</th>
                  <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--muted-foreground)' }}>View</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {applications.map(app => {
                  const s = statusConfig(app.status);
                  const SIcon = s.icon;
                  const date = app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
                  return (
                    <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-5">
                        <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{app.grantName}</p>
                        <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--muted-foreground)' }}>{app.applicationReference}</p>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                          <Building2 size={14} /> {app.organization || '—'}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.color} ${s.bg}`}>
                          <SIcon size={11} /> {s.label}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>{app.matchedGrantsCount}</span>
                        <span className="text-xs ml-1" style={{ color: 'var(--muted-foreground)' }}>grants</span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                          <Calendar size={13} /> {date}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link href="/dashboard/grants" className="p-2 rounded-lg inline-flex transition-colors hover:bg-primary/10" style={{ color: 'var(--primary)' }}>
                          <ArrowRight size={17} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
