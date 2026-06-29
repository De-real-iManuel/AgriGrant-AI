import React from 'react';
import { XCircle, CheckCircle2, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import FileUploadSlot from './FileUploadSlot';

interface DocumentTopUpScreenProps {
  selectedGrantId: string;
  docSubmitError: string | null;
  docSubmitSuccess: boolean;
  payloadChecklist: string[];
  derivedMissing: string[];
  topupFiles: any;
  setTopupFiles: (val: any) => void;
  formData: any;
  setActiveTab: (val: number) => void;
  handleDocTopupSubmit: () => void;
  isSubmittingDocs: boolean;
}

export default function DocumentTopUpScreen({
  selectedGrantId,
  docSubmitError,
  docSubmitSuccess,
  payloadChecklist,
  derivedMissing,
  topupFiles,
  setTopupFiles,
  formData,
  setActiveTab,
  handleDocTopupSubmit,
  isSubmittingDocs
}: DocumentTopUpScreenProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
          Screen 2 — Document Upload Top-up
        </span>
        <h2 className="text-xl font-bold mt-1">
          We need a few more documents for your <strong>{selectedGrantId || 'selected grant'}</strong> application
        </h2>
        <p className="text-sm text-muted-foreground">
          BPMN: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">task_farmer_uploads_docs</code> — uploads go to <code className="bg-slate-100 px-1 rounded font-mono text-[10px]">/api/profile/upload-documents</code>
        </p>
      </div>

      {docSubmitError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
          <XCircle size={14} /> {docSubmitError}
        </div>
      )}
      {docSubmitSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 size={14} /> Documents submitted! Moving to Proposal Review…
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 card-elevated p-5 space-y-4 h-fit">
          <h4 className="font-bold text-xs uppercase tracking-wider pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
            Trust Vault Status
          </h4>
          <div className="space-y-3">
            {payloadChecklist.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic">No checklist from Document Understanding Agent yet.</p>
            ) : (
              payloadChecklist.map((doc, idx) => {
                const isMissing = derivedMissing.some(m => typeof m === 'string' && m.toLowerCase().includes(String(doc).toLowerCase().slice(0, 10)));
                return (
                  <div key={idx} className={`flex items-center gap-2 text-xs font-medium ${isMissing ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {isMissing ? <AlertTriangle size={14} className="flex-shrink-0" /> : <CheckCircle2 size={14} className="flex-shrink-0" />}
                    <span className="truncate" title={doc}>{doc} {isMissing ? '(Needs Update)' : '(Verified)'}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="card-elevated p-6 space-y-4">
            <h3 className="font-bold text-sm text-amber-700">Required Document Uploads</h3>
            <p className="text-xs text-muted-foreground">
              Upload any flagged or missing documents below. Accepted: PDF, JPG, PNG, DOC.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FileUploadSlot label="🏦 Updated Bank Statement (last 6 months) *" fileKey="bankStatement" file={topupFiles.bankStatement || null} onSet={f => setTopupFiles((p: any) => ({ ...p, bankStatement: f }))} onClear={() => setTopupFiles((p: any) => ({ ...p, bankStatement: null }))} />
              <FileUploadSlot label="🆔 NIN / Identity Document" fileKey="ninDoc" file={topupFiles.ninDoc || null} onSet={f => setTopupFiles((p: any) => ({ ...p, ninDoc: f }))} onClear={() => setTopupFiles((p: any) => ({ ...p, ninDoc: null }))} />
              <FileUploadSlot label="📜 Land Document (updated)" fileKey="landDoc" file={topupFiles.landDoc || null} onSet={f => setTopupFiles((p: any) => ({ ...p, landDoc: f }))} onClear={() => setTopupFiles((p: any) => ({ ...p, landDoc: null }))} />
              <FileUploadSlot label="📸 Farm Photo" fileKey="farmPhoto" file={topupFiles.farmPhoto || null} onSet={f => setTopupFiles((p: any) => ({ ...p, farmPhoto: f }))} onClear={() => setTopupFiles((p: any) => ({ ...p, farmPhoto: null }))} />
              {formData.hasCAC && <FileUploadSlot label="🏢 CAC Certificate" fileKey="cac" file={topupFiles.cac || null} onSet={f => setTopupFiles((p: any) => ({ ...p, cac: f }))} onClear={() => setTopupFiles((p: any) => ({ ...p, cac: null }))} />}
            </div>
          </div>

          <div className="flex justify-between items-center border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <button type="button" onClick={() => setActiveTab(1)} className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-muted" style={{ borderColor: 'var(--border)' }}>
              Back to Selection
            </button>
            <button
              type="button"
              onClick={handleDocTopupSubmit}
              disabled={isSubmittingDocs || docSubmitSuccess}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 text-white ${isSubmittingDocs ? 'bg-emerald-400 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700 shadow-md active:scale-95'}`}
            >
              {isSubmittingDocs ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : <>Submit Documents <ArrowRight size={13} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
