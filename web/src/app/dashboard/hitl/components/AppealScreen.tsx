import React from 'react';
import { XCircle, Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface AppealScreenProps {
  appealError: string | null;
  selectedGrantId: string;
  matchedGrants: any[];
  bodyData: any;
  appRef: string | null;
  appealAction: 'appeal' | 'retry' | 'close';
  setAppealAction: (val: any) => void;
  appealNotes: string;
  setAppealNotes: (val: string) => void;
  handleAppealDecision: () => void;
  isSubmittingAppeal: boolean;
}

export default function AppealScreen({
  appealError,
  selectedGrantId,
  matchedGrants,
  bodyData,
  appRef,
  appealAction,
  setAppealAction,
  appealNotes,
  setAppealNotes,
  handleAppealDecision,
  isSubmittingAppeal
}: AppealScreenProps) {
  const safeStr = (v: any, fallback = '') => {
    if (v == null) return fallback;
    return typeof v === 'string' ? v.trim() : String(v).trim();
  };
  const safeArr = (v: any): any[] => {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string' && v.trim() !== '') return v.split(',').map(s => s.trim());
    return [];
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 animate-pulse">
          Screen 4 — Rejection & Appeal
        </span>
        <h2 className="text-xl font-bold mt-1">Application Rejected by Portal</h2>
        <p className="text-sm text-muted-foreground">
          BPMN: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">task_specialist_reviews_rejection</code>
        </p>
      </div>

      {appealError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
          <XCircle size={14} /> {appealError}
        </div>
      )}

      {/* Rejection Summary */}
      <div className="card-elevated p-6 border-l-4 border-red-500 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 font-mono">RPA Portal Log Scraper Output</span>
            <h3 className="font-bold text-base mt-1" style={{ color: 'var(--foreground)' }}>
              {selectedGrantId || (matchedGrants[0]?.grantName) || 'Selected Grant'}
            </h3>
            <p className="text-xs text-muted-foreground">
              Rejection Reference: <span className="font-mono font-bold">REJ-{safeStr(bodyData.jobId) || appRef || 'pending'}</span>
            </p>
          </div>
          <div className="p-3 bg-red-50 text-red-700 rounded-lg flex flex-col items-center font-semibold">
            <span className="text-2xl font-bold font-mono">
              {bodyData.recommendations?.recoverabilityScore ?? bodyData.overallEligibilityScore ?? '—'} / 10
            </span>
            <span className="text-[9px] uppercase font-bold tracking-wider text-red-600">Recoverability</span>
          </div>
        </div>
        <div className="p-3.5 bg-red-50/50 text-red-800 text-xs rounded-lg border border-red-200 leading-relaxed font-mono">
          <strong>RPA Scraped Reason:</strong> "{safeStr(bodyData.rejectionResponse || bodyData.analystNarrative) || 'No rejection reason captured by the RPA scraper yet.'}"
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Recommendation */}
        <div className="card-elevated p-5 space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider pb-2 border-b flex items-center gap-1.5" style={{ borderColor: 'var(--border)' }}>
            <Sparkles size={14} className="text-emerald-600" /> AI Appeal Recommendation
          </h4>
          <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <p>{safeStr(bodyData.analystNarrative) || 'The Validation Agent has assessed the rejection. Review the suggested grounds below before deciding whether to file an appeal.'}</p>
            <div className="space-y-1.5 font-semibold">
              <strong className="block text-slate-600">Profile gaps (from pipeline):</strong>
              {safeArr(bodyData.profileGaps2).length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {safeArr(bodyData.profileGaps2).map((gap: string, i: number) => <li key={i}>{gap}</li>)}
                </ul>
              ) : (
                <p className="italic text-muted-foreground font-normal">No profile gaps surfaced.</p>
              )}
            </div>
          </div>
        </div>

        {/* Specialist Action */}
        <div className="card-elevated p-5 space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
            Specialist Action Panel
          </h4>
          <div className="space-y-2">
            {[
              { id: 'appeal', label: 'File Appeal', sub: 'Routes to task_prepare_appeal' },
              { id: 'retry', label: 'Accept Rejection, Try Different Grant', sub: 'Loops back to task_present_options' },
              { id: 'close', label: 'Accept Rejection, Close Application', sub: 'Ends pipeline execution' },
            ].map(opt => (
              <label key={opt.id} className="flex items-center gap-2.5 p-3 rounded-lg border text-xs font-semibold cursor-pointer hover:bg-muted/30 select-none">
                <input type="radio" name="appealAction" checked={appealAction === opt.id as any} onChange={() => setAppealAction(opt.id as any)} />
                <div>
                  <span className="block">{opt.label}</span>
                  <span className="text-[10px] text-muted-foreground font-normal">{opt.sub}</span>
                </div>
              </label>
            ))}
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase" htmlFor="actionNotes">Notes / Directives</label>
            <textarea id="actionNotes" rows={3} className="input-base text-xs" value={appealNotes} onChange={e => setAppealNotes(e.target.value)} placeholder="Add specialist directives here…" />
          </div>
          <button type="button" onClick={handleAppealDecision} disabled={isSubmittingAppeal}
            className={`w-full py-2.5 rounded-lg text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-1.5 ${
              isSubmittingAppeal ? 'bg-slate-400 cursor-wait' :
              appealAction === 'appeal' ? 'bg-blue-600 hover:bg-blue-700' :
              appealAction === 'retry' ? 'bg-amber-600 hover:bg-amber-700' :
              'bg-red-600 hover:bg-red-700'}`}>
            {isSubmittingAppeal ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : <>Submit Decision <ArrowRight size={13} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
