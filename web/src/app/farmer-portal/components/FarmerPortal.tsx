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

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
function validate(data: FarmerFormData): Partial<Record<keyof FarmerFormData, string>> {
  const errs: Partial<Record<keyof FarmerFormData, string>> = {};
  if (!data.farmerName.trim()) errs.farmerName = 'Please enter your name or business name';
  if (!data.stateOfResidence) errs.stateOfResidence = 'Please select your state of residence';
  if (!data.farmType) errs.farmType = 'Please select your farm type';
  if (!data.fundingPurpose.trim()) errs.fundingPurpose = 'Please describe what you need funding for';
  return errs;
}

// ---------------------------------------------------------------------------
// Mock pipeline — replace with real UiPath Apps / API call
// ---------------------------------------------------------------------------
async function callNigerianAgriGrantPipeline(
  form: FarmerFormData,
  isPro: boolean,
): Promise<PipelineOutput> {
  // Simulate ~8 second pipeline execution
  await new Promise((res) => setTimeout(res, 8000));

  const allGrants = [
    {
      grantName: 'CBN Anchor Borrowers Programme',
      grantingOrganization: 'Central Bank of Nigeria',
      matchScore: 92,
      fundingAmountRange: '₦500,000 – ₦5,000,000',
      applicationDeadline: 'Rolling — apply via DMB',
      matchReason: `Strong match for ${form.farmType} farmers in ${form.stateOfResidence}. Smallholder focus aligns with your profile.`,
      grantCategory: 'Federal Credit Scheme',
      applicationUrl: 'https://www.cbn.gov.ng',
    },
    {
      grantName: 'NIRSAL Agro-Geo-Cooperative Scheme',
      grantingOrganization: 'NIRSAL Plc',
      matchScore: form.isMemberOfCooperative ? 88 : 65,
      fundingAmountRange: '₦1,000,000 – ₦50,000,000',
      applicationDeadline: 'Q3 2025',
      matchReason: form.isMemberOfCooperative
        ? 'Cooperative membership significantly increases eligibility under NIRSAL AGCS terms.'
        : 'Partial match — joining a cooperative would improve eligibility significantly.',
      grantCategory: 'Guarantee & Credit',
      applicationUrl: 'https://www.nirsal.com',
    },
    {
      grantName: 'Bank of Agriculture MSME Loan',
      grantingOrganization: 'Bank of Agriculture (BOA)',
      matchScore: 79,
      fundingAmountRange: '₦200,000 – ₦20,000,000',
      applicationDeadline: 'Open — visit nearest BOA branch',
      matchReason: `BOA specifically targets ${form.stateOfResidence} farmers. ${form.hasLandDocument ? 'Land document strengthens collateral.' : ''}`,
      grantCategory: 'Development Finance',
      applicationUrl: 'https://www.boanigeria.com',
    },
    {
      grantName: 'FMARD Youth in Agri-Business (PYXERA)',
      grantingOrganization: 'Federal Ministry of Agriculture & Rural Development',
      matchScore: form.isYouthFarmer ? 85 : 50,
      fundingAmountRange: '₦250,000 – ₦2,000,000',
      applicationDeadline: 'April 30, 2025',
      matchReason: form.isYouthFarmer
        ? 'Youth farmer designation gives you priority under FMARD youth agri-business programme.'
        : 'Age criteria not confirmed — verify if you qualify as a youth farmer (18–35).',
      grantCategory: 'Youth Empowerment',
      applicationUrl: 'https://www.fmard.gov.ng',
    },
    {
      grantName: "AGSMEIS Women's Agri-Enterprise Grant",
      grantingOrganization: 'Bankers Committee / CBN',
      matchScore: form.isWomanFarmer ? 91 : 42,
      fundingAmountRange: '₦500,000 – ₦10,000,000',
      applicationDeadline: 'June 15, 2025',
      matchReason: form.isWomanFarmer
        ? 'Designed specifically for women-led agricultural enterprises.'
        : 'Limited eligibility without woman-led farm designation.',
      grantCategory: "Women's Enterprise",
      applicationUrl: 'https://www.cbn.gov.ng/agsmeis',
    },
  ].sort((a, b) => b.matchScore - a.matchScore);

  // FREE plan: cap at 1 grant
  const matchedGrants = isPro ? allGrants : allGrants.slice(0, 1);

  const profileGaps: string[] = [];
  if (!form.hasCACRegistration)
    profileGaps.push('Register with the Corporate Affairs Commission (CAC) to unlock federal grants.');
  if (!form.hasLandDocument)
    profileGaps.push('Obtain a Certificate of Occupancy (C of O) or Survey Plan to strengthen collateral.');
  if (!form.isMemberOfCooperative)
    profileGaps.push('Join a registered cooperative — many programmes prioritise cooperative members.');
  if (!form.isYouthFarmer && !form.isWomanFarmer)
    profileGaps.push('Demographic-specific grants (Youth, Women) are unavailable for your profile.');
  if ((form.farmingExperienceYears as number) < 2)
    profileGaps.push('Some programmes require ≥2 years farming experience.');

  const topGrant = allGrants[0];
  const topRecommendation = `Apply immediately to the ${topGrant.grantName} — ${topGrant.matchScore}% match. ${topGrant.matchReason}`;

  const summary = isPro
    ? `We found ${allGrants.length} grant programmes matching your profile as a ${form.farmType} farmer in ${form.stateOfResidence}. The ${topGrant.grantName} offers the strongest match at ${topGrant.matchScore}%. ${form.fundingPurpose ? `Your stated need — "${form.fundingPurpose}" — aligns with multiple federal and state-level disbursement windows.` : ''} Review each grant card below and click Apply Now to begin your application.`
    : `We found ${allGrants.length} grant programmes matching your profile. You are on the Free plan — showing your top match only. Upgrade to Pro to see all ${allGrants.length} opportunities with rich proposal data.`;

  const disclaimer =
    'Grant availability, amounts, and deadlines are subject to change without notice. AgriGrant AI provides eligibility guidance only and does not guarantee approval.';

  return {
    matchedGrants,
    profileGaps,
    topRecommendation,
    summary,
    disclaimer,
    totalMatchesFound: allGrants.length, // always show real total
    farmerName: form.farmerName,
    stateOfResidence: form.stateOfResidence,
    isPro,
    hiddenGrantsCount: isPro ? 0 : allGrants.length - 1,
  };
}

// ---------------------------------------------------------------------------
// Portal container
// ---------------------------------------------------------------------------
export default function FarmerPortal() {
  const { user } = useAuth();
  const { saveResult } = usePortalResults();
  const router = useRouter();
  const isPro = user?.plan === 'pro';

  const [page, setPage] = useState<PortalPage>('form');
  const [formData, setFormData] = useState<FarmerFormData>(defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FarmerFormData, string>>>({});
  const [pipelineOutput, setPipelineOutput] = useState<PipelineOutput | null>(null);
  const firstErrorRef = useRef<HTMLDivElement>(null);

  const patchForm = useCallback((patch: Partial<FarmerFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
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
      const output = await callNigerianAgriGrantPipeline(formData, isPro);
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
        isPro,
        hiddenGrantsCount: 0,
      };
      setPipelineOutput(errorOutput);
      saveResult(errorOutput);
    } finally {
      setPage('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [formData, isPro, saveResult]);

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
