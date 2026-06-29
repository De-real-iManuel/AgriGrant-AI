import React from 'react';
import {
  Code,
  RefreshCw,
  AlertTriangle,
  User,
  ArrowRight,
  XCircle,
  WifiOff,
  Loader2,
  Wifi
} from 'lucide-react';
import { toast } from 'sonner';

interface PayloadPanelProps {
  showPayloadEditor: boolean;
  setShowPayloadEditor: (val: boolean) => void;
  matchedGrants: any[];
  sseStatus: 'idle' | 'connecting' | 'live' | 'error';
  jobId: string | null;
  appRef: string | null;
  handleClearPayload: () => void;
  pendingTasks: any[];
  setPayloadText: (val: string) => void;
  setLivePayload: (val: any) => void;
  payloadText: string;
  payloadError: string | null;
  handleLoadPayload: () => void;
  sseEvents: any[];
}

export default function PayloadPanel({
  showPayloadEditor,
  setShowPayloadEditor,
  matchedGrants,
  sseStatus,
  jobId,
  appRef,
  handleClearPayload,
  pendingTasks,
  setPayloadText,
  setLivePayload,
  payloadText,
  payloadError,
  handleLoadPayload,
  sseEvents
}: PayloadPanelProps) {

  const SseBadge = () => {
    const colors = {
      idle: 'bg-slate-100 text-slate-500',
      connecting: 'bg-amber-100 text-amber-700 animate-pulse',
      live: 'bg-emerald-100 text-emerald-700',
      error: 'bg-red-100 text-red-700',
    };
    const icons = {
      idle: <WifiOff size={11} />,
      connecting: <Loader2 size={11} className="animate-spin" />,
      live: <Wifi size={11} />,
      error: <WifiOff size={11} />,
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${colors[sseStatus]}`}>
        {icons[sseStatus]}
        {sseStatus === 'idle' ? 'Disconnected' : sseStatus === 'connecting' ? 'Connecting…' : sseStatus === 'live' ? 'Live SSE' : 'SSE Error'}
      </span>
    );
  };

  return (
    <div className="card-elevated border-b p-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => setShowPayloadEditor(!showPayloadEditor)}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors"
        >
          <Code size={16} className="text-emerald-600" />
          {showPayloadEditor ? 'Hide Payload Editor' : 'Paste / Edit UiPath JSON Payload'}
          <span className="bg-emerald-50 px-2 py-0.5 rounded text-[10px] text-emerald-800 font-mono">
            {matchedGrants.length} Grants Loaded
          </span>
        </button>

        <div className="flex items-center gap-3">
          <SseBadge />
          {jobId && (
            <span className="text-[10px] font-mono text-slate-500">
              Job: <strong>{jobId}</strong>
              {appRef ? ` · Ref: ${appRef}` : ''}
            </span>
          )}
          <button
            onClick={handleClearPayload}
            className="text-[10px] font-bold text-slate-500 hover:text-red-500 flex items-center gap-1"
          >
            <RefreshCw size={11} /> Clear
          </button>
        </div>
      </div>

      {pendingTasks.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2 animate-in fade-in">
          <h4 className="text-amber-800 text-xs font-bold flex items-center gap-2 mb-2">
            <AlertTriangle size={14} /> Action Required: {pendingTasks.length} Pending UiPath Tasks
          </h4>
          <div className="flex flex-wrap gap-2">
            {pendingTasks.map(task => (
              <button
                key={task.task_id}
                onClick={() => {
                  setPayloadText(JSON.stringify(task.metadata || {}, null, 2));
                  setLivePayload({ body: task.metadata?.body || task.metadata || {}, jobId: task.task_id });
                  toast.success(`Loaded task: ${task.title}`);
                }}
                className="bg-white border border-amber-300 hover:border-amber-500 text-amber-900 text-[11px] px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-2 shadow-sm"
              >
                <User size={12} className="text-amber-600" />
                {task.title}
                <ArrowRight size={12} className="opacity-50" />
              </button>
            ))}
          </div>
        </div>
      )}

      {showPayloadEditor && (
        <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-150">
          <p className="text-xs text-muted-foreground">
            Paste the JSON body from your UiPath pipeline output. The grant cards and form fields will self-populate instantly.
            Supports both <code className="bg-slate-100 px-1 rounded font-mono text-[10px]">{'{ body: {...} }'}</code> and raw body objects.
          </p>
          <textarea
            className="w-full h-64 p-3 font-mono text-xs border rounded-lg bg-slate-50 dark:bg-slate-900"
            style={{ borderColor: 'var(--border)' }}
            placeholder={`{\n  "body": {\n    "matchedGrants2": [...],\n    "farmerName6": "Your Name",\n    ...\n  }\n}`}
            value={payloadText}
            onChange={e => setPayloadText(e.target.value)}
          />
          {payloadError && (
            <div className="p-2 rounded text-xs bg-red-50 text-red-600 font-semibold flex items-center gap-1.5">
              <XCircle size={14} /> Parse Error: {payloadError}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowPayloadEditor(false)} className="px-3 py-1.5 border rounded-lg text-xs font-semibold hover:bg-slate-100">
              Cancel
            </button>
            <button onClick={handleLoadPayload} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm">
              Load Payload & Refresh UI
            </button>
          </div>
        </div>
      )}

      {sseEvents.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 max-h-32 overflow-y-auto space-y-1">
          {[...sseEvents].reverse().map((ev, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px]">
              <span className="text-slate-400 font-mono shrink-0">{ev.time}</span>
              <span className={`font-bold shrink-0 ${ev.type.includes('fail') || ev.type.includes('error') || ev.type.includes('reject') ? 'text-red-600' : ev.type.includes('complete') || ev.type.includes('approve') ? 'text-emerald-600' : 'text-blue-600'}`}>
                [{ev.type}]
              </span>
              <span className="text-slate-600 dark:text-slate-300">{ev.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
