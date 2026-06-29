import React from 'react';
import { Loader2, Sliders, Check, ArrowRight } from 'lucide-react';

interface GrantSelectionScreenProps {
  matchedGrants: any[];
  formData: any;
  selectedGrantId: string;
  setSelectedGrantId: (val: string) => void;
  handleGrantConfirm: () => void;
  isConfirmingGrant: boolean;
  grantFilters: { category: string; search: string };
  setGrantFilters: (val: any) => void;
}

export default function GrantSelectionScreen({
  matchedGrants,
  formData,
  selectedGrantId,
  setSelectedGrantId,
  handleGrantConfirm,
  isConfirmingGrant,
  grantFilters,
  setGrantFilters
}: GrantSelectionScreenProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            Screen 1 — Grant Selection
          </span>
          <h2 className="text-xl font-bold mt-1">
            {matchedGrants.length > 0
              ? `We found ${matchedGrants.length} grants you may qualify for, ${formData.fullName || 'Farmer'} 🌱`
              : 'Awaiting grant results from pipeline…'}
          </h2>
          <p className="text-sm text-muted-foreground">
            BPMN: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">task_farmer_selects_grant</code>
          </p>
        </div>
        {selectedGrantId && (
          <button
            onClick={handleGrantConfirm}
            disabled={isConfirmingGrant}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold text-white flex items-center gap-2 shadow-md ${isConfirmingGrant ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isConfirmingGrant ? <><Loader2 size={14} className="animate-spin" /> Confirming…</> : <>Confirm Grant & Continue <ArrowRight size={13} /></>}
          </button>
        )}
      </div>

      {matchedGrants.length === 0 ? (
        <div className="text-center p-12 bg-slate-50 border rounded-xl">
          <Loader2 size={32} className="animate-spin mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-500">Waiting for pipeline to return matched grants…</p>
          <p className="text-xs text-slate-400 mt-1">Paste a JSON payload above or submit the onboarding form.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 card-elevated p-5 space-y-5 h-fit">
            <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: 'var(--border)' }}>
              <Sliders size={16} className="text-blue-600" />
              <h4 className="font-bold text-xs uppercase tracking-wider">Filter Matches</h4>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase" htmlFor="search">Search</label>
              <input id="search" type="text" placeholder="e.g. Tony, USAID…" className="input-base text-xs" value={grantFilters.search} onChange={e => setGrantFilters({ ...grantFilters, search: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase block">Category</label>
              <div className="space-y-1.5">
                {['All', 'private', 'state', 'federal', 'international', 'development-bank'].map(cat => (
                  <label key={cat} className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                    <input type="radio" name="grantCat" checked={grantFilters.category === cat} onChange={() => setGrantFilters({ ...grantFilters, category: cat })} />
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {matchedGrants
              .filter(g => {
                if (!g) return false;
                if (grantFilters.category !== 'All' && g.grantCategory !== grantFilters.category) return false;
                if (grantFilters.search && !(g.grantName || '').toLowerCase().includes(grantFilters.search.toLowerCase())) return false;
                return true;
              })
              .map((grant, idx) => {
                const isSelected = selectedGrantId === grant.grantName;
                return (
                  <div key={idx} className={`card-elevated p-5 border transition-all relative overflow-hidden ${isSelected ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20' : 'hover:border-slate-300'}`}>
                    <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
                      <div className="absolute top-4 -right-8 w-28 bg-emerald-600 text-white text-[10px] font-bold text-center py-1 rotate-45">
                        {grant.matchScore}% Match
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div>
                        <span className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">{grant.grantCategory}</span>
                        <h3 className="font-bold text-base mt-1" style={{ color: 'var(--foreground)' }}>🏛️ {grant.grantName}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">By {grant.grantingOrganization}</p>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{grant.description}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Funding Range</span>
                          <span className="font-bold text-blue-600">{grant.fundingAmountRange}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Deadline</span>
                          <span className="font-bold">{grant.applicationDeadline || 'Verify'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Scope</span>
                          <span className="font-bold capitalize">{grant.geographicScope || 'Nigeria'}</span>
                        </div>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                        <strong>Why this matches:</strong> {grant.matchReason}
                      </div>
                      {Array.isArray(grant.requiredDocuments) && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground block">Required Documents:</span>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {grant.requiredDocuments.map((doc: string, i: number) => (
                              <span key={i} className="inline-flex items-center gap-1 bg-slate-50 border px-2 py-0.5 rounded text-[10px] text-slate-700">
                                <Check size={9} className="text-emerald-600" /> {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between border-t pt-3 mt-1" style={{ borderColor: 'var(--border)' }}>
                        <a href={grant.applicationUrl || '#'} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                          [ Link to Portal ↗ ]
                        </a>
                        <button
                          type="button"
                          onClick={() => setSelectedGrantId(grant.grantName || '')}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-muted/60 text-muted-foreground hover:bg-muted'}`}
                        >
                          {isSelected ? '✓ Grant Selected' : 'Select This Grant'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
