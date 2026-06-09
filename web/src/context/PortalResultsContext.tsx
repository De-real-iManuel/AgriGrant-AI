'use client';
/**
 * PortalResultsContext
 * --------------------
 * Bridges the Farmer Portal results into the Dashboard.
 * Stores the last pipeline output in memory (sessionStorage-backed).
 * Manages active grant application cases and enforces the freemium business model rules:
 * - Free users: max 1 active grant case submission.
 * - Pro users: multiple grant case submissions.
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { PipelineOutput, MatchedGrant } from '@/app/farmer-portal/components/portalTypes';

export interface ActiveCase {
  id: string;
  caseNumber: string;
  grantName: string;
  body: string;
  stage: number;
  totalStages: number;
  stageName: string;
  progress: number;
  status: 'active' | 'working' | 'review';
  matchScore: number;
  funding: string;
  deadline: string;
  daysLeft: number;
  stages: string[];
  completedStages: number[];
  activeStage: number;
}

interface PortalResultsContextValue {
  latestResult: PipelineOutput | null;
  activeCases: ActiveCase[];
  saveResult: (output: PipelineOutput) => void;
  clearResult: () => void;
  submitGrantCase: (grant: MatchedGrant, isPro: boolean) => { success: boolean; error?: string };
}

const PortalResultsContext = createContext<PortalResultsContextValue | null>(null);

const SESSION_KEY = 'agrigrant_portal_result';
const CASES_KEY = 'agrigrant_active_cases';

// Default simulation cases for "Emmanuel Okafor" if no search has been done yet
const DEFAULT_CASES: ActiveCase[] = [
  {
    id: 'case-AG-2026-001',
    caseNumber: 'AG-2026-001',
    grantName: 'CBN Anchor Borrowers Programme',
    body: 'Central Bank of Nigeria',
    stage: 4,
    totalStages: 7,
    stageName: 'Document Collection',
    progress: 57,
    status: 'active',
    matchScore: 91,
    funding: '₦2.5M',
    deadline: '23 May 2026',
    daysLeft: 7,
    stages: ['Intake', 'Discovery', 'Eligibility', 'Documents', 'Proposal', 'Review', 'Submit'],
    completedStages: [0, 1, 2],
    activeStage: 3,
  },
  {
    id: 'case-AG-2026-002',
    caseNumber: 'AG-2026-002',
    grantName: 'NIRSAL Agricultural Lending',
    body: 'NIRSAL Plc / CBN',
    stage: 5,
    totalStages: 7,
    stageName: 'Proposal Generation',
    progress: 68,
    status: 'working',
    matchScore: 88,
    funding: '₦18M',
    deadline: '15 Jun 2026',
    daysLeft: 32,
    stages: ['Intake', 'Discovery', 'Eligibility', 'Documents', 'Proposal', 'Review', 'Submit'],
    completedStages: [0, 1, 2, 3],
    activeStage: 4,
  },
];

export function PortalResultsProvider({ children }: { children: ReactNode }) {
  const [latestResult, setLatestResult] = useState<PipelineOutput | null>(null);
  const [activeCases, setActiveCases] = useState<ActiveCase[]>([]);

  // Rehydrate latestResult and activeCases on mount
  useEffect(() => {
    try {
      const rawResult = sessionStorage.getItem(SESSION_KEY);
      if (rawResult) setLatestResult(JSON.parse(rawResult));

      const rawCases = localStorage.getItem(CASES_KEY);
      if (rawCases) {
        setActiveCases(JSON.parse(rawCases));
      } else {
        // Start with default simulation cases
        setActiveCases(DEFAULT_CASES);
        localStorage.setItem(CASES_KEY, JSON.stringify(DEFAULT_CASES));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveResult = useCallback((output: PipelineOutput) => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(output));
    } catch {
      // ignore
    }
    setLatestResult(output);
  }, []);

  const clearResult = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setLatestResult(null);
  }, []);

  const submitGrantCase = useCallback((grant: MatchedGrant, isPro: boolean) => {
    // Check if already applied to this grant
    const alreadyExists = activeCases.some(
      (c) => c.grantName.toLowerCase() === grant.grantName.toLowerCase()
    );
    if (alreadyExists) {
      return { success: false, error: 'You have already submitted an application for this grant.' };
    }

    // Freemium restriction: max 1 active case
    if (!isPro && activeCases.length >= 1) {
      return {
        success: false,
        error: 'freemium_limit_exceeded',
      };
    }

    // Add new case
    const caseNum = `AG-2026-${String(activeCases.length + 1).padStart(3, '0')}`;
    const newCase: ActiveCase = {
      id: `case-${caseNum}`,
      caseNumber: caseNum,
      grantName: grant.grantName,
      body: grant.grantingOrganization,
      stage: 1,
      totalStages: 7,
      stageName: 'Intake Completed',
      progress: 14,
      status: 'working',
      matchScore: grant.matchScore,
      funding: grant.fundingAmountRange,
      deadline: grant.applicationDeadline,
      daysLeft: 30, // Default simulation days left
      stages: ['Intake', 'Discovery', 'Eligibility', 'Documents', 'Proposal', 'Review', 'Submit'],
      completedStages: [0],
      activeStage: 1,
    };

    const updated = [newCase, ...activeCases];
    setActiveCases(updated);
    try {
      localStorage.setItem(CASES_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    return { success: true };
  }, [activeCases]);

  return (
    <PortalResultsContext.Provider
      value={{
        latestResult,
        activeCases,
        saveResult,
        clearResult,
        submitGrantCase,
      }}
    >
      {children}
    </PortalResultsContext.Provider>
  );
}

export function usePortalResults(): PortalResultsContextValue {
  const ctx = useContext(PortalResultsContext);
  if (!ctx) throw new Error('usePortalResults must be used inside PortalResultsProvider');
  return ctx;
}

