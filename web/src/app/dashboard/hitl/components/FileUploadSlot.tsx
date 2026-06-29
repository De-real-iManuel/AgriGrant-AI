import React, { useRef } from 'react';
import { Trash2, Upload } from 'lucide-react';

export default function FileUploadSlot({
  label, fileKey, file, onSet, onClear,
}: {
  label: string;
  fileKey: string;
  file: File | null;
  onSet: (f: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="border rounded-xl p-3 flex flex-col justify-between gap-2" style={{ borderColor: 'var(--border)' }}>
      <span className="text-xs font-semibold block text-slate-700">{label}</span>
      {file ? (
        <div className="flex items-center justify-between bg-emerald-50 text-emerald-700 p-2 rounded text-xs">
          <span className="truncate max-w-[150px] font-mono">{file.name}</span>
          <button type="button" onClick={onClear} className="text-red-500 hover:text-red-700">
            <Trash2 size={13} />
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="border border-dashed p-3 rounded-lg text-xs flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/30 gap-1"
          >
            <Upload size={16} className="text-slate-400" /> Upload File
          </button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={e => { if (e.target.files?.[0]) onSet(e.target.files[0]); }}
          />
        </>
      )}
    </div>
  );
}
