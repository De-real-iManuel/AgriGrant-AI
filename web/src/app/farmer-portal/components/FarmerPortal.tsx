'use client';
import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PortalHeader from './PortalHeader';
import FarmerIntakeForm from './FarmerIntakeForm';
import ProcessingScreen from './ProcessingScreen';
import ResultsDashboard from './ResultsDashboard';
import {
  FarmerFormData,
  PipelineOutput,
  PortalPage,
  defaultFormData,
} from './portalTypes';
import { useAuth } from '@/context/AuthContext';
import { usePortalResults } from '@/context/PortalResultsContext';
import { uploadAllDocuments, saveFarmerProfile } from '@/lib/storageService';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
function validate(data: FarmerFormData): Partial<Record<keyof FarmerFormData, string>> {
  const errs: Partial<Record<keyof FarmerFormData, string>> = {};
  if (!data.farmerName.trim()) errs.farmerName = 'Please enter your name or business name';
  if (!data.stateOfResidence) errs.stateOfResidence = 'Please select your state of residence';
  if (!data.farmType) errs.farmType = 'Please select your farm type';
  if (!data.fundingPurpose.trim()) errs.fundingPurpose = 'Please describe what you need funding for';
  if (!data.ninDocument) errs.ninDocument = 'NIN Slip / NIMC Card upload is required';
  return errs;
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Pipeline API Integration - calling the FastAPI backend endpoints
// ---------------------------------------------------------------------------
async function callNigerianAgriGrantPipeline(
  form: FarmerFormData
): Promise<PipelineOutput> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  // Step 1: Submit Form to API
  const submitRes = await fetch(`${backendUrl}/api/pipeline/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(form),
  });

  if (!submitRes.ok) {
    const errorData = await submitRes.json();
    const errorMsg = errorData?.detail?.message || errorData?.detail?.errors || 'Form validation failed.';
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }

  const submitData = await submitRes.json();
  const jobId = submitData.jobId;

  if (submitData.status === 'DISQUALIFIED') {
    return {
      matchedGrants: [],
      profileGaps: [],
      topRecommendation: '',
      summary: '',
      disclaimer: '',
      totalMatchesFound: 0,
      farmerName: form.farmerName,
      stateOfResidence: form.stateOfResidence,
      error: submitData.message,
      hiddenGrantsCount: 0,
    };
  }

  // Step 2: Poll status endpoint until completion
  let attempts = 0;
  const maxAttempts = 30; // Max 90 seconds
  while (attempts < maxAttempts) {
    await new Promise((res) => setTimeout(res, 3000));
    
    const statusRes = await fetch(`${backendUrl}/api/pipeline/status/${jobId}`);
    if (!statusRes.ok) {
      throw new Error('Failed to query pipeline status.');
    }

    const statusData = await statusRes.json();
    if (statusData.state === 'COMPLETED') {
      return statusData.result;
    } else if (statusData.state === 'FAILED') {
      throw new Error(statusData.error || 'The matching pipeline encountered an error.');
    }

    attempts++;
  }

  throw new Error('Pipeline request timed out. Please try again.');
}

// ---------------------------------------------------------------------------
// Portal container
// ---------------------------------------------------------------------------
export default function FarmerPortal() {
  const { user } = useAuth();
  const { saveResult } = usePortalResults();
  const router = useRouter();

  const [page, setPage] = useState<PortalPage>('form');
  const [formData, setFormData] = useState<FarmerFormData>(defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FarmerFormData, string>>>({});
  const [pipelineOutput, setPipelineOutput] = useState<PipelineOutput | null>(null);
  const [uploadFiles, setUploadFiles] = useState<Record<string, File | undefined>>({});
  const firstErrorRef = useRef<HTMLDivElement>(null);

  const patchForm = useCallback((patch: Partial<FarmerFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleFileSelect = useCallback((documentType: string, file: File | null) => {
    setUploadFiles((prev) => ({
      ...prev,
      [documentType]: file || undefined,
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const errs = validate(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors({});
    setPage('processing');

    try {
      // Step 1: Upload documents to Supabase Storage (if user is logged in)
      let documentPaths: Record<string, string | null> = {};
      const userId = user?.id;
      if (userId && Object.values(uploadFiles).some(Boolean)) {
        documentPaths = await uploadAllDocuments(uploadFiles, userId);
      }

      // Step 2: Save profile to backend database
      if (userId) {
        await saveFarmerProfile({
          userId,
          ...formData,
          ninDocumentPath: documentPaths.ninDocumentPath || null,
          cacDocumentPath: documentPaths.cacDocumentPath || null,
          bankStatementPath: documentPaths.bankStatementPath || null,
          landDocumentPath: documentPaths.landDocumentPath || null,
        });
      }

      // Step 3: Save to localStorage for chat context
      localStorage.setItem('agrigrant_farmer_profile', JSON.stringify({
        ...formData,
        ninDocumentPath: documentPaths.ninDocumentPath || null,
        cacDocumentPath: documentPaths.cacDocumentPath || null,
        bankStatementPath: documentPaths.bankStatementPath || null,
        landDocumentPath: documentPaths.landDocumentPath || null,
      }));

      // Step 4: Run the grant matching pipeline
      const output = await callNigerianAgriGrantPipeline(formData);
      setPipelineOutput(output);
      // Save to context so dashboard can pick it up
      saveResult(output);
    } catch {
      const errorOutput: PipelineOutput = {
        matchedGrants: [],
        profileGaps: [],
        topRecommendation: '',
        summary: '',
        disclaimer: '',
        totalMatchesFound: 0,
        farmerName: formData.farmerName,
        stateOfResidence: formData.stateOfResidence,
        error: 'An error occurred while contacting the AgriGrant pipeline. Please try again.',
        hiddenGrantsCount: 0,
      };
      setPipelineOutput(errorOutput);
      saveResult(errorOutput);
    } finally {
      setPage('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [formData, saveResult, user, uploadFiles]);

  const handleStartNew = useCallback(() => {
    setFormData(defaultFormData);
    setErrors({});
    setPipelineOutput(null);
    setPage('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleGoToDashboard = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      <PortalHeader />

      <main className="flex-1 w-full px-4 sm:px-6 py-8 sm:py-10">
        {page === 'form' && (
          <div ref={firstErrorRef}>
            <FarmerIntakeForm
              data={formData}
              onChange={patchForm}
              errors={errors}
              onSubmit={handleSubmit}
              onFileSelect={handleFileSelect}
            />
          </div>
        )}

        {page === 'processing' && (
          <div className="flex items-center justify-center min-h-[70vh]">
            <ProcessingScreen farmerName={formData.farmerName} />
          </div>
        )}

        {page === 'results' && pipelineOutput && (
          <ResultsDashboard
            output={pipelineOutput}
            onStartNew={handleStartNew}
            onGoToDashboard={handleGoToDashboard}
          />
        )}
      </main>
    </div>
  );
}
