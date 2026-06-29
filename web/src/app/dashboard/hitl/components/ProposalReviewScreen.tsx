import React from 'react';
import { XCircle, CheckCircle2, FileSignature, Loader2, ArrowRight } from 'lucide-react';

interface ProposalReviewScreenProps {
  reviewError: string | null;
  activeProposalSection: 'cover' | 'letter' | 'description' | 'budget' | 'annexures';
  setActiveProposalSection: (val: any) => void;
  formData: any;
  bodyData: any;
  selectedGrantId: string;
  topupFiles: any;
  checklist: any;
  setChecklist: (val: any) => void;
  proposalDecision: 'approve' | 'revisions' | 'reject';
  setProposalDecision: (val: any) => void;
  proposalComments: string;
  setProposalComments: (val: string) => void;
  handleProposalReview: () => void;
  isSubmittingReview: boolean;
}

export default function ProposalReviewScreen({
  reviewError,
  activeProposalSection,
  setActiveProposalSection,
  formData,
  bodyData,
  selectedGrantId,
  topupFiles,
  checklist,
  setChecklist,
  proposalDecision,
  setProposalDecision,
  proposalComments,
  setProposalComments,
  handleProposalReview,
  isSubmittingReview
}: ProposalReviewScreenProps) {
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
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
          Screen 3 — Proposal Review (Internal Specialist)
        </span>
        <h2 className="text-xl font-bold mt-1">Proposal Quality Review Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          BPMN: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">task_proposal_review_hitl</code>
        </p>
      </div>

      {reviewError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
          <XCircle size={14} /> {reviewError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 card-elevated p-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 min-h-[500px] max-h-[650px] overflow-y-auto font-serif relative">
          <div className="flex border-b font-sans text-xs mb-6 overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
            {[
              { id: 'cover', label: '1. Cover Page' },
              { id: 'letter', label: '2. Application Letter' },
              { id: 'description', label: '3. Project Description' },
              { id: 'budget', label: '4. Budget' },
              { id: 'annexures', label: '5. Annexures' },
            ].map(sec => (
              <button key={sec.id} type="button" onClick={() => setActiveProposalSection(sec.id as any)}
                className={`px-3 py-2 border-b-2 font-semibold transition-all whitespace-nowrap ${activeProposalSection === sec.id ? 'border-emerald-600 text-emerald-700 bg-white dark:bg-slate-800' : 'border-transparent text-muted-foreground hover:bg-muted/40'}`}>
                {sec.label}
              </button>
            ))}
          </div>

          <div className="space-y-4 text-slate-800 dark:text-slate-200">
            {activeProposalSection === 'cover' && (
              <div className="text-center py-10 space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-2xl">🏛️</div>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 font-sans">Business Proposal Document</p>
                  <h1 className="text-2xl font-extrabold tracking-tight font-sans text-emerald-800 dark:text-emerald-500">
                    {formData.projectTitle || safeStr(bodyData.projectTittle) || '—'}
                  </h1>
                  <p className="text-sm font-sans italic text-slate-600">Submitted for {selectedGrantId || '—'}</p>
                </div>
                <div className="pt-8 text-xs space-y-1 font-sans text-slate-500 text-left max-w-sm mx-auto border-t font-semibold">
                  <p><strong>Applicant:</strong> {formData.fullName || safeStr(bodyData.farmerName6)}</p>
                  <p><strong>Farm Type:</strong> {formData.farmType || safeStr(bodyData.farmType)}</p>
                  <p><strong>Location:</strong> {formData.farmAddress || safeStr(bodyData.vtZKCiqUt)}</p>
                  <p><strong>Requested Funding:</strong> ₦{(parseInt(formData.requestedAmount || '0') || 0).toLocaleString()}</p>
                  <p><strong>Date Generated:</strong> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            )}
            {activeProposalSection === 'letter' && (
              <div className="space-y-4 text-xs font-sans text-slate-700 dark:text-slate-300 px-4">
                <div className="text-right">
                  <p>{formData.fullName || safeStr(bodyData.farmerName6)}</p>
                  <p>{formData.farmAddress || safeStr(bodyData.vtZKCiqUt)}</p>
                  <p>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="text-left font-bold">
                  <p>To: The Coordinator,</p>
                  <p>{selectedGrantId || '—'},</p>
                  <p>{formData.stateOfResidence || safeStr(bodyData.stateOfResidence)} State Regional Office.</p>
                </div>
                <p className="font-bold text-center border-b pb-1">
                  SUBJECT: APPLICATION FOR FUNDING — '{(formData.projectTitle || '').toUpperCase()}'
                </p>
                <p>Dear Sir/Ma,</p>
                <p className="leading-relaxed">
                  I am writing to formally submit our application under the {selectedGrantId || '—'}. As a smallholder crop farmer operating {formData.farmSize || '—'} hectares in {formData.lgaOfResidence || '—'} LGA, {formData.stateOfResidence || '—'} State, my farm specialises in {(formData.cropsOrLivestock || []).join(', ') || safeArr(bodyData.vvf8WstMO).join(', ')}.
                </p>
                <p className="leading-relaxed">
                  The primary purpose of this request is for <strong>{formData.fundingPurpose || '—'}</strong> to scale production and expand operations.
                </p>
                <p className="pt-4">Yours Faithfully,</p>
                <p className="font-bold underline">{formData.fullName || safeStr(bodyData.farmerName6)}</p>
              </div>
            )}
            {activeProposalSection === 'description' && (
              <div className="space-y-4 text-xs leading-relaxed px-4">
                <h4 className="font-sans font-bold text-sm text-emerald-800">1. Project Intent & Scope</h4>
                <p>{formData.projectDescription || safeStr(bodyData.summary2) || '—'}</p>
                <h4 className="font-sans font-bold text-sm text-emerald-800 mt-4">2. Operations Challenges Addressed</h4>
                <p>{formData.challenges || safeStr(bodyData.farmingChallenges) || '—'}</p>
              </div>
            )}
            {activeProposalSection === 'budget' && (
              <div className="space-y-4 px-4">
                <h4 className="font-sans font-bold text-sm text-emerald-800">Project Financial Breakdown</h4>
                <table className="w-full text-left text-xs font-sans border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-100">
                      <th className="p-2 font-bold">Item</th>
                      <th className="p-2 font-bold">Qty</th>
                      <th className="p-2 font-bold text-right">Cost (NGN)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { item: 'Production Inputs & Aggregates', qty: 'Bulk', pct: 0.4 },
                      { item: 'Equipment Infrastructure', qty: 'Units', pct: 0.4 },
                      { item: 'Transport & Logistics', qty: 'Aggregate', pct: 0.2 },
                    ].map(({ item, qty, pct }) => (
                      <tr key={item} className="border-b">
                        <td className="p-2">{item}</td>
                        <td className="p-2">{qty}</td>
                        <td className="p-2 text-right">₦{Math.round((parseInt(formData.requestedAmount || '0') || 0) * pct).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td className="p-2" colSpan={2}>Total Estimated Project Cost</td>
                      <td className="p-2 text-right text-emerald-700">₦{(parseInt(formData.requestedAmount || '0') || 0).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {activeProposalSection === 'annexures' && (
              <div className="space-y-4 text-xs font-sans px-4">
                <h4 className="font-sans font-bold text-sm text-emerald-800">Verified Payload Annexures</h4>
                <div className="space-y-2">
                  {[
                    { label: 'NIN Identity Document', value: formData.ninFile?.name },
                    { label: 'Bank Statement (Updated)', value: topupFiles.bankStatement?.name || formData.bankStatementFile?.name },
                    { label: 'Land Document', value: topupFiles.landDoc?.name || formData.landDocFile?.name },
                    { label: 'Farm Photo', value: topupFiles.farmPhoto?.name || formData.farmPhotoFile?.name },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-2 rounded border flex items-center justify-between">
                      <span className="font-semibold text-slate-700">{label}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${value ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                        {value || 'Not uploaded'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 card-elevated p-6 space-y-5">
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              QA Checks (AI-Assisted)
            </h4>
            <p className="text-[10px] text-muted-foreground mt-1">Pre-analyzed by the Validation Agent. Toggle to override.</p>
          </div>
          <div className="space-y-2.5">
            {[
              { key: 'alignmentClear', label: 'Grant Alignment Clear' },
              { key: 'budgetRealistic', label: 'Budget Realistic & Justified' },
              { key: 'languageProfessional', label: 'Language & Grammar Professional' },
              { key: 'annexuresListed', label: 'All Supporting Annexures Present' },
              { key: 'noFabricatedFacts', label: 'No Fabricated Facts / Hallucinations' },
            ].map(chk => (
              <label key={chk.key} className="flex items-center justify-between p-2 rounded-lg border text-xs font-semibold cursor-pointer hover:bg-muted/30 select-none">
                <span>{chk.label}</span>
                <input type="checkbox" checked={(checklist as any)[chk.key]} onChange={() => setChecklist((p: any) => ({ ...p, [chk.key]: !(p as any)[chk.key] }))} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
              </label>
            ))}
          </div>
          <div className="space-y-2 pt-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase block">Decision Action</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'approve', label: 'Approve', icon: <CheckCircle2 size={16} className="text-emerald-600" />, color: 'border-emerald-500 bg-emerald-50/50 text-emerald-800' },
                { id: 'revisions', label: 'Revisions', icon: <FileSignature size={16} className="text-amber-600" />, color: 'border-amber-500 bg-amber-50/50 text-amber-800' },
                { id: 'reject', label: 'Reject', icon: <XCircle size={16} className="text-red-600" />, color: 'border-red-500 bg-red-50/50 text-red-800' },
              ].map(opt => (
                <button key={opt.id} type="button" onClick={() => setProposalDecision(opt.id as any)}
                  className={`p-2.5 border rounded-lg text-center flex flex-col items-center justify-center gap-1 transition-all ${proposalDecision === opt.id ? `${opt.color} shadow-sm ring-1 ring-current/20` : 'hover:bg-muted/40'}`}>
                  {opt.icon}
                  <span className="text-[10px] font-bold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase" htmlFor="comments">Reviewer Comments</label>
            <textarea id="comments" rows={3} className="input-base text-xs" value={proposalComments} onChange={e => setProposalComments(e.target.value)} placeholder="Add your review notes here…" />
          </div>
          <button type="button" onClick={handleProposalReview} disabled={isSubmittingReview}
            className={`w-full py-2.5 rounded-lg text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-1.5 ${
              isSubmittingReview ? 'bg-slate-400 cursor-wait' :
              proposalDecision === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' :
              proposalDecision === 'revisions' ? 'bg-amber-600 hover:bg-amber-700' :
              'bg-red-600 hover:bg-red-700'}`}>
            {isSubmittingReview ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : <>Submit Review Decision <ArrowRight size={13} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
