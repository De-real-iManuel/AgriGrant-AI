'use client';
import React, { useCallback } from 'react';
import { Search } from 'lucide-react';
import {
  FarmerFormData,
  NIGERIAN_STATES,
  FARM_TYPES,
  CROPS_LIVESTOCK,
  LIVESTOCK_RELATED,
  FarmType,
} from './portalTypes';
import ToggleSwitch from './ToggleSwitch';

interface Props {
  data: FarmerFormData;
  onChange: (patch: Partial<FarmerFormData>) => void;
  errors: Partial<Record<keyof FarmerFormData, string>>;
  onSubmit: () => void;
  onFileSelect?: (documentType: string, file: File | null) => void;
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      className="flex items-center gap-3 mb-4"
      style={{ borderBottom: '2px solid var(--primary)', paddingBottom: 8 }}
    >
      <h2 className="text-base font-bold tracking-tight" style={{ color: 'var(--primary)' }}>
        {label}
      </h2>
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-xs font-medium" style={{ color: 'var(--destructive)' }}>
      {msg}
    </p>
  );
}

export default function FarmerIntakeForm({
  data,
  onChange,
  errors,
  onSubmit,
  onFileSelect,
}: Props) {
  const toggleCrop = useCallback(
    (crop: string) => {
      const current = data.cropOrLivestockTypes;
      onChange({
        cropOrLivestockTypes: current.includes(crop)
          ? current.filter((c) => c !== crop)
          : [...current, crop],
      });
    },
    [data.cropOrLivestockTypes, onChange]
  );

  const highlightedCrops =
    data.farmType && LIVESTOCK_RELATED[data.farmType]
      ? LIVESTOCK_RELATED[data.farmType as string]
      : [];

  const handleFarmSizeChange = (val: string) => {
    const num = val === '' ? '' : parseFloat(val);
    onChange({
      farmSizeHectares: num,
      isSmallholderFarmer: num !== '' && (num as number) < 5,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Title */}
      <div className="mb-8 text-center">
        <h1
          className="text-2xl font-extrabold tracking-tight"
          style={{ color: 'var(--foreground)' }}
        >
          Farmer Profile Intake Form
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Fill in your details so our AI can match you with the best grants
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* ── Section A ── */}
        <section
          className="rounded-2xl p-5 sm:p-6"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <SectionHeader label="Section A — Basic Information" />
          <div className="flex flex-col gap-4">
            {/* Farmer Name */}
            <div>
              <label className="label-base" htmlFor="farmerName">
                Farmer / Business Name <span style={{ color: 'var(--destructive)' }}>*</span>
              </label>
              <input
                id="farmerName"
                type="text"
                className="input-base"
                placeholder="e.g. Emeka Obi Farms Ltd"
                value={data.farmerName}
                onChange={(e) => onChange({ farmerName: e.target.value })}
                aria-required="true"
                style={errors.farmerName ? { borderColor: 'var(--destructive)' } : {}}
              />
              <FieldError msg={errors.farmerName} />
            </div>

            {/* State */}
            <div>
              <label className="label-base" htmlFor="stateOfResidence">
                State of Residence <span style={{ color: 'var(--destructive)' }}>*</span>
              </label>
              <select
                id="stateOfResidence"
                className="input-base"
                value={data.stateOfResidence}
                onChange={(e) => onChange({ stateOfResidence: e.target.value })}
                aria-required="true"
                style={errors.stateOfResidence ? { borderColor: 'var(--destructive)' } : {}}
              >
                <option value="">Select a state…</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <FieldError msg={errors.stateOfResidence} />
            </div>

            {/* LGA */}
            <div>
              <label className="label-base" htmlFor="lga">
                Local Government Area (LGA)
              </label>
              <input
                id="lga"
                type="text"
                className="input-base"
                placeholder="e.g. Ikeja"
                value={data.lga}
                onChange={(e) => onChange({ lga: e.target.value })}
              />
            </div>

            {/* Farm Address */}
            <div>
              <label className="label-base" htmlFor="farmAddress">
                Farm / Business Address <span style={{ color: 'var(--destructive)' }}>*</span>
              </label>
              <input
                id="farmAddress"
                type="text"
                className="input-base"
                placeholder="e.g. Km 12, Ikorodu Road, Lagos"
                value={data.farmAddress}
                onChange={(e) => onChange({ farmAddress: e.target.value })}
                aria-required="true"
                style={errors.farmAddress ? { borderColor: 'var(--destructive)' } : {}}
              />
              <FieldError msg={errors.farmAddress} />
            </div>

            {/* Farm Type */}
            <div>
              <label className="label-base" htmlFor="farmType">
                Farm Type <span style={{ color: 'var(--destructive)' }}>*</span>
              </label>
              <select
                id="farmType"
                className="input-base"
                value={data.farmType}
                onChange={(e) => onChange({ farmType: e.target.value as FarmType })}
                aria-required="true"
                style={errors.farmType ? { borderColor: 'var(--destructive)' } : {}}
              >
                <option value="">Select farm type…</option>
                {FARM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <FieldError msg={errors.farmType} />
            </div>

            {/* Crops / Livestock */}
            <div>
              <label className="label-base">Crops / Livestock</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {CROPS_LIVESTOCK.map((crop) => {
                  const selected = data.cropOrLivestockTypes.includes(crop);
                  const highlighted = highlightedCrops.includes(crop);
                  return (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => toggleCrop(crop)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150"
                      style={{
                        backgroundColor: selected
                          ? 'var(--primary)'
                          : highlighted
                            ? '#DCFCE7'
                            : 'var(--muted)',
                        color: selected
                          ? '#fff'
                          : highlighted
                            ? 'var(--primary)'
                            : 'var(--muted-foreground)',
                        borderColor: selected
                          ? 'var(--primary)'
                          : highlighted
                            ? 'var(--primary)'
                            : 'var(--border)',
                        outline: highlighted && !selected ? '1.5px solid var(--primary)' : 'none',
                      }}
                    >
                      {crop}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Section B ── */}
        <section
          className="rounded-2xl p-5 sm:p-6"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <SectionHeader label="Section B — Farm Details" />
          <div className="flex flex-col gap-4">
            {/* Farm Size + Revenue row on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-base" htmlFor="farmSize">
                  Farm Size (Hectares)
                </label>
                <input
                  id="farmSize"
                  type="number"
                  min={0}
                  max={10000}
                  step="0.1"
                  className="input-base"
                  placeholder="e.g. 2.5"
                  value={data.farmSizeHectares}
                  onChange={(e) => handleFarmSizeChange(e.target.value)}
                />
              </div>
              <div>
                <label className="label-base" htmlFor="annualRevenue">
                  Annual Revenue (NGN)
                </label>
                <input
                  id="annualRevenue"
                  type="number"
                  min={0}
                  step={1000}
                  className="input-base"
                  placeholder="e.g. 1500000"
                  value={data.annualRevenueNGN}
                  onChange={(e) =>
                    onChange({
                      annualRevenueNGN: e.target.value === '' ? '' : parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="label-base" htmlFor="experience">
                Farming Experience (Years)
              </label>
              <input
                id="experience"
                type="number"
                min={0}
                max={100}
                className="input-base"
                placeholder="e.g. 5"
                value={data.farmingExperienceYears}
                onChange={(e) =>
                  onChange({
                    farmingExperienceYears:
                      e.target.value === '' ? '' : parseInt(e.target.value, 10),
                  })
                }
              />
            </div>

            {/* Funding Purpose */}
            <div>
              <label className="label-base" htmlFor="fundingPurpose">
                Funding Purpose <span style={{ color: 'var(--destructive)' }}>*</span>
              </label>
              <textarea
                id="fundingPurpose"
                rows={3}
                className="input-base resize-none"
                placeholder="e.g. Irrigation infrastructure, Equipment purchase, Seeds &amp; Fertilizer procurement"
                value={data.fundingPurpose}
                onChange={(e) => onChange({ fundingPurpose: e.target.value })}
                aria-required="true"
                style={errors.fundingPurpose ? { borderColor: 'var(--destructive)' } : {}}
              />
              <FieldError msg={errors.fundingPurpose} />
            </div>
          </div>
        </section>

        {/* ── Section C ── */}
        <section
          className="rounded-2xl p-5 sm:p-6"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <SectionHeader label="Section C — Profile Flags" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToggleSwitch
              id="smallholder"
              checked={data.isSmallholderFarmer}
              onChange={(v) => onChange({ isSmallholderFarmer: v })}
              label="Smallholder Farmer"
              description="Farm under 5 hectares"
              disabled={
                data.farmSizeHectares !== '' &&
                typeof data.farmSizeHectares === 'number' &&
                data.farmSizeHectares < 5
              }
            />
            <ToggleSwitch
              id="youth"
              checked={data.isYouthFarmer}
              onChange={(v) => onChange({ isYouthFarmer: v })}
              label="Youth Farmer"
              description="Aged 18–35 years"
            />
            <ToggleSwitch
              id="woman"
              checked={data.isWomanFarmer}
              onChange={(v) => onChange({ isWomanFarmer: v })}
              label="Woman-led / Woman Farmer"
              description="Woman-owned or woman-led farm"
            />
            <ToggleSwitch
              id="cac"
              checked={data.hasCACRegistration}
              onChange={(v) => onChange({ hasCACRegistration: v })}
              label="CAC Registered Business"
              description="Registered with Corporate Affairs Commission"
            />
            <ToggleSwitch
              id="land"
              checked={data.hasLandDocument}
              onChange={(v) => onChange({ hasLandDocument: v })}
              label="Has Land Document"
              description="C of O, R of O, or Survey Plan"
            />
            <ToggleSwitch
              id="coop"
              checked={data.isMemberOfCooperative}
              onChange={(v) => onChange({ isMemberOfCooperative: v })}
              label="Cooperative Member"
              description="Active registered cooperative member"
            />
            <ToggleSwitch
              id="bvn"
              checked={data.hasBVN}
              onChange={(v) => onChange({ hasBVN: v })}
              label="Has BVN"
              description="Bank Verification Number enrolled"
            />
            <ToggleSwitch
              id="default"
              checked={data.hasNoLoanDefault}
              onChange={(v) => onChange({ hasNoLoanDefault: v })}
              label="CRMS Credit History Issue"
              description="Existing default on Credit Risk database"
            />
          </div>
        </section>

        {/* ── Section D ── */}
        <section
          className="rounded-2xl p-5 sm:p-6"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <SectionHeader label="Section D — Additional Notes" />
          <div>
            <label className="label-base" htmlFor="additionalNotes">
              Additional Notes{' '}
              <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>(Optional)</span>
            </label>
            <textarea
              id="additionalNotes"
              rows={4}
              className="input-base resize-none"
              placeholder="Any other relevant information, e.g. previous grant history, prior funding commitments, farm certifications..."
              value={data.additionalNotes}
              onChange={(e) => onChange({ additionalNotes: e.target.value })}
            />
          </div>
        </section>

        {/* ── Section E — Document Uploads ── */}
        <section
          className="rounded-2xl p-5 sm:p-6"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <SectionHeader label="Section E — Supporting Documents" />
          <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
            Provide scanned copies or clear photos of your documents (max 5MB per file).
          </p>
          <div className="flex flex-col gap-4">
            {/* NIN Document */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                NIN Slip / NIMC Card <span style={{ color: 'var(--destructive)' }}>*</span>
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  onChange({ ninDocument: file ? file.name : null });
                  onFileSelect?.('ninDocument', file);
                }}
                className="block w-full text-xs text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-semibold
                  file:bg-emerald-50 file:text-emerald-700
                  hover:file:bg-emerald-100"
              />
              <FieldError msg={errors.ninDocument} />
            </div>

            {/* CAC Document */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                CAC Certificate (if applicable)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  onChange({ cacDocument: file ? file.name : null });
                  onFileSelect?.('cacDocument', file);
                }}
                className="block w-full text-xs text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-semibold
                  file:bg-emerald-50 file:text-emerald-700
                  hover:file:bg-emerald-100"
              />
            </div>

            {/* Bank Statement */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                Bank Statement (Last 6 Months){' '}
                <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>
                  (Optional - required later by some grantors)
                </span>
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  onChange({ bankStatement: file ? file.name : null });
                  onFileSelect?.('bankStatement', file);
                }}
                className="block w-full text-xs text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-semibold
                  file:bg-emerald-50 file:text-emerald-700
                  hover:file:bg-emerald-100"
              />
              <FieldError msg={errors.bankStatement} />
            </div>

            {/* Land Document */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                Land Document (C of O / R of O / Survey Plan)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  onChange({ landDocument: file ? file.name : null });
                  onFileSelect?.('landDocument', file);
                }}
                className="block w-full text-xs text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-semibold
                  file:bg-emerald-50 file:text-emerald-700
                  hover:file:bg-emerald-100"
              />
            </div>
          </div>
        </section>

        {/* Submit */}
        <button
          type="button"
          onClick={onSubmit}
          className="w-full flex items-center justify-center gap-2 font-bold text-base text-white rounded-xl transition-all duration-150 active:scale-95"
          style={{
            backgroundColor: 'var(--primary)',
            minHeight: 56,
            boxShadow: '0 4px 16px rgba(22,101,52,0.35)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#14532D';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--primary)';
          }}
        >
          <Search size={20} />
          Find My Grants 🔍
        </button>
      </div>
    </div>
  );
}
