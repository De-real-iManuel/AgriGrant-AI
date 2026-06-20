'use client';
import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PortalHeader from './PortalHeader';
import FarmerIntakeForm from './FarmerIntakeForm';
import { FarmerFormData, PortalPage, defaultFormData } from './portalTypes';
import { useAuth } from '@/context/AuthContext';
import { uploadAllDocuments, saveFarmerProfile } from '@/lib/storageService';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
function validate(data: FarmerFormData): Partial<Record<keyof FarmerFormData, string>> {
  const errs: Partial<Record<keyof FarmerFormData, string>> = {};
  if (!data.farmerName.trim()) errs.farmerName = 'Please enter your name or business name';
  if (!data.stateOfResidence) errs.stateOfResidence = 'Please select your state of residence';
  if (!data.farmAddress?.trim()) errs.farmAddress = 'Please enter your farm or business address';
  if (!data.farmType) errs.farmType = 'Please select your farm type';
  if (!data.fundingPurpose.trim())
    errs.fundingPurpose = 'Please describe what you need funding for';
  if (!data.ninDocument) errs.ninDocument = 'NIN Slip / NIMC Card upload is required';
  return errs;
}

// ---------------------------------------------------------------------------
// Pipeline submit — returns jobId, stores it for chat SSE stream
// ---------------------------------------------------------------------------
async function submitPipeline(form: FarmerFormData): Promise<string> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  const submitRes = await fetch(`${backendUrl}/api/pipeline/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  });

  if (!submitRes.ok) {
    const errorData = await submitRes.json();
    const errorMsg =
      errorData?.detail?.message || errorData?.detail?.errors || 'Form validation failed.';
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }

  const submitData = await submitRes.json();

  if (submitData.status === 'DISQUALIFIED') {
    throw new Error(
      submitData.message ||
        'You do not meet the eligibility requirements for federal grants at this time.'
    );
  }

  // Store jobId so the chat page can stream live stages via SSE
  if (submitData.jobId) {
    try {
      localStorage.setItem('agrigrant_active_pipeline_job', submitData.jobId);
    } catch (e) {}
  }

  return submitData.jobId;
}

// ---------------------------------------------------------------------------
// Portal container
// ---------------------------------------------------------------------------
export default function FarmerPortal() {
  const { user } = useAuth();
  const router = useRouter();

  const [page, setPage] = useState<PortalPage>('form');
  const [formData, setFormData] = useState<FarmerFormData>(defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FarmerFormData, string>>>({});
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
      // Upload documents to Supabase Storage (if user is logged in)
      let documentPaths: Record<string, string | null> = {};
      const userId = user?.id;
      if (userId && Object.values(uploadFiles).some(Boolean)) {
        documentPaths = await uploadAllDocuments(uploadFiles, userId);
      }

      // Save profile to backend database
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

      // Save to localStorage for chat context
      localStorage.setItem(
        'agrigrant_farmer_profile',
        JSON.stringify({
          ...formData,
          ninDocumentPath: documentPaths.ninDocumentPath || null,
          cacDocumentPath: documentPaths.cacDocumentPath || null,
          bankStatementPath: documentPaths.bankStatementPath || null,
          landDocumentPath: documentPaths.landDocumentPath || null,
        })
      );

      // Submit pipeline and redirect to chat for live stage streaming
      await submitPipeline(formData);
      router.push('/dashboard/chat');
    } catch (err: any) {
      const errorMsg = err?.message || 'An error occurred while submitting your application.';
      try {
        localStorage.setItem('agrigrant_pipeline_error', errorMsg);
      } catch (e) {}
      router.push('/dashboard/chat');
    }
  }, [formData, user, uploadFiles, router]);

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
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Submitting your application...
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
