'use client';
import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

const STEPS = [
  { emoji: '📤', label: 'Uploading your documents...' },
  { emoji: '🔍', label: 'Analysing your profile...' },
  { emoji: '🌐', label: 'Searching federal & state grants (CBN, NIRSAL, BOA, FMARD)...' },
  { emoji: '⚖️', label: 'Running Eligibility & Risk Assessment...' },
  { emoji: '📝', label: 'Generating grant proposals...' },
  { emoji: '📊', label: 'Preparing your dashboard...' },
];

interface Props {
  farmerName: string;
}

export default function ProcessingScreen({ farmerName }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    // Cycle through steps: each step takes ~1.6 s visually
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < STEPS.length - 1) {
          setCompletedSteps((c) => [...c, prev]);
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  const progress = Math.round((completedSteps.length / STEPS.length) * 100);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-8 py-10">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 text-center">
        {/* Spinner */}
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" stroke="var(--border)" strokeWidth="6" fill="none" />
            <circle
              cx="40"
              cy="40"
              r="34"
              stroke="var(--primary)"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center text-lg font-bold"
            style={{ color: 'var(--primary)' }}
          >
            {progress}%
          </span>
        </div>

        <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
          {farmerName
            ? `Finding the best grants for ${farmerName}...`
            : 'Finding your best grants...'}
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Our AI agents are working — this takes about 8 seconds
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full">
        <div className="progress-track">
          <div
            className="progress-fill-green"
            style={{
              width: `${progress}%`,
              transition: 'width 0.8s ease',
            }}
          />
        </div>
      </div>

      {/* Steps list */}
      <div className="w-full flex flex-col gap-2">
        {STEPS.map((step, i) => {
          const isDone = completedSteps.includes(i);
          const isActive = i === activeStep;
          const isPending = !isDone && !isActive;

          let stateClass = 'workflow-step-pending';
          if (isDone) stateClass = 'workflow-step-done';
          if (isActive) stateClass = 'workflow-step-active-state';

          return (
            <div key={i} className={stateClass}>
              {/* Icon / spinner */}
              <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center">
                {isDone ? (
                  <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                ) : isActive ? (
                  <span className="text-base agent-pulse">{step.emoji}</span>
                ) : (
                  <span className="text-base opacity-40">{step.emoji}</span>
                )}
              </div>
              <span
                className="text-sm font-medium"
                style={{
                  color: isDone
                    ? 'var(--success)'
                    : isActive
                      ? 'var(--accent-foreground)'
                      : 'var(--muted-foreground)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {step.label}
              </span>
              {/* Active pulse dot */}
              {isActive && (
                <span className="ml-auto flex-shrink-0">
                  <span className="agent-dot-yellow" />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Branding note */}
      <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
        Powered by AgriGrant AI · Multi-Agent Pipeline
      </p>
    </div>
  );
}
