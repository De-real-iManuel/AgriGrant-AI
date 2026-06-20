'use client';
import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader, FileText, Search, Shield, PenTool, Eye, Send } from 'lucide-react';

const workflowSteps = [
  {
    id: 'step-discovery',
    icon: Search,
    label: 'Grant Discovery',
    agent: 'Discovery Agent',
    description: 'Scanning 200+ grant programs',
    color: '#166534',
    bgColor: '#DCFCE7',
  },
  {
    id: 'step-eligibility',
    icon: Shield,
    label: 'Eligibility Analysis',
    agent: 'Eligibility Agent',
    description: 'Calculating match score: 91%',
    color: '#059669',
    bgColor: '#D1FAE5',
  },
  {
    id: 'step-documents',
    icon: FileText,
    label: 'Document Validation',
    agent: 'Document Agent',
    description: 'Verifying CAC, Farm Certificate',
    color: '#0D9488',
    bgColor: '#CCFBF1',
  },
  {
    id: 'step-proposal',
    icon: PenTool,
    label: 'Proposal Generation',
    agent: 'Proposal Agent',
    description: 'Drafting executive summary...',
    color: '#CA8A04',
    bgColor: '#FEF9C3',
  },
  {
    id: 'step-review',
    icon: Eye,
    label: 'Human Review',
    agent: 'Review Stage',
    description: 'Awaiting your approval',
    color: '#2563EB',
    bgColor: '#DBEAFE',
  },
  {
    id: 'step-submission',
    icon: Send,
    label: 'Submission',
    agent: 'Submit Agent',
    description: 'Filing to CBN portal',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
  },
];

export default function AnimatedWorkflow() {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        const next = (prev + 1) % workflowSteps.length;
        if (next === 0) {
          setCompletedSteps([]);
        } else {
          setCompletedSteps((c) => [...c, prev]);
        }
        return next;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-full max-w-sm xl:max-w-md rounded-3xl p-6 shadow-card-hover"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p
            className="text-xs font-semibold tracking-wide uppercase"
            style={{ color: 'var(--muted-foreground)' }}
          >
            AI Case Processing
          </p>
          <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--foreground)' }}>
            CBN Anchor Borrowers Programme
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: '#DCFCE7', color: 'var(--primary)' }}
        >
          <span
            className="agent-dot-green w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--secondary)' }}
          />
          Live
        </div>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-2.5">
        {workflowSteps.map((step, idx) => {
          const isDone = completedSteps.includes(idx);
          const isActive = activeStep === idx;
          const isPending = !isDone && !isActive;
          const StepIcon = step.icon;

          return (
            <div
              key={step.id}
              className="flex items-center gap-3 p-3 rounded-xl transition-all duration-500"
              style={{
                backgroundColor: isDone ? '#F0FDF4' : isActive ? step.bgColor : 'var(--muted)',
                border: `1px solid ${isDone ? '#BBF7D0' : isActive ? step.bgColor : 'var(--border)'}`,
                opacity: isPending ? 0.55 : 1,
              }}
            >
              {/* Status icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                style={{
                  backgroundColor: isDone
                    ? '#DCFCE7'
                    : isActive
                      ? step.bgColor
                      : 'var(--background)',
                }}
              >
                {isDone ? (
                  <CheckCircle size={18} style={{ color: 'var(--primary)' }} />
                ) : isActive ? (
                  <Loader size={18} style={{ color: step.color }} className="animate-spin" />
                ) : (
                  <StepIcon size={18} style={{ color: 'var(--muted-foreground)' }} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold truncate"
                  style={{
                    color: isDone || isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                  }}
                >
                  {step.label}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  {isDone ? `${step.agent} ✓ Complete` : isActive ? step.description : step.agent}
                </p>
              </div>

              {/* Right badge */}
              {isDone && <span className="badge-active text-xs">Done</span>}
              {isActive && <span className="badge-pending text-xs">Active</span>}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-5">
        <div
          className="flex justify-between text-xs mb-1.5"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <span className="font-medium">Overall Progress</span>
          <span className="font-bold" style={{ color: 'var(--primary)' }}>
            {Math.round((completedSteps.length / workflowSteps.length) * 100)}%
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill-green transition-all duration-700"
            style={{ width: `${(completedSteps.length / workflowSteps.length) * 100}%` }}
          />
        </div>
        <p className="text-xs mt-1.5" style={{ color: 'var(--muted-foreground)' }}>
          {completedSteps.length} of {workflowSteps.length} stages complete
        </p>
      </div>
    </div>
  );
}
