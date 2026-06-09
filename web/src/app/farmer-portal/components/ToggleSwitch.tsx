import React from 'react';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
  disabled?: boolean;
}

export default function ToggleSwitch({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-start gap-3 cursor-pointer select-none group"
      style={{ opacity: disabled ? 0.6 : 1 }}
    >
      {/* Track */}
      <div className="relative flex-shrink-0 mt-0.5" style={{ width: 44, height: 24 }}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className="w-full h-full rounded-full transition-all duration-200"
          style={{
            backgroundColor: checked ? 'var(--primary)' : 'var(--border)',
            boxShadow: checked ? '0 0 0 3px rgba(22,101,52,0.12)' : 'none',
          }}
        />
        {/* Thumb */}
        <div
          className="absolute top-0.5 rounded-full bg-white shadow-sm transition-all duration-200"
          style={{
            width: 20,
            height: 20,
            left: checked ? 22 : 2,
          }}
        />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          {label}
        </span>
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {description}
        </span>
      </div>
    </label>
  );
}
