'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileSignature,
  XCircle,
  Upload,
  ArrowRight,
  Sliders,
  DollarSign,
  MapPin,
  Layers,
  FileCode,
  Sparkles,
  RefreshCw,
  Trash2,
  User,
  Map,
  Shield,
  Briefcase,
  Code,
  Check,
  Loader2,
  Radio,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { toast } from 'sonner';
import AuthGuard from '@/components/ui/AuthGuard';
import DashboardShell from '../Components/DashboardShell';

// ──────────────────────────────────────────────────────────────
// CONFIG — reads from .env
// ──────────────────────────────────────────────────────────────
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const PORTAL_URL = process.env.NEXT_PUBLIC_UIPATH_PORTAL_URL || 'https://www.api.agrigrant.xyz/v1';

// ──────────────────────────────────────────────────────────────
// STATIC LOOKUP DATA
// ──────────────────────────────────────────────────────────────
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara',
];

const LGA_MAPPING: Record<string, string[]> = {
  'Rivers': ['Port-Harcourt', 'Obio-Akpor', 'Okrika', 'Ogu-Bolo', 'Eleme', 'Tai', 'Gokana', 'Khana'],
  'Lagos': ['Ikeja', 'Alimosho', 'Oshodi-Isolo', 'Surulere', 'Epe', 'Ikorodu', 'Lagos Island'],
  'Benue': ['Makurdi', 'Gboko', 'Otukpo', 'Katsina-Ala', 'Vandeikya', 'Gwer East', 'Ogbadibo'],
  'FCT (Abuja)': ['Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali', 'Abaji'],
  'Kano': ['Fagge', 'Dala', 'Gwale', 'Nassarawa', 'Tarauni', 'Kano Municipal', 'Ungogo'],
};
const DEFAULT_LGAS = ['LGA Area 1', 'LGA Area 2', 'LGA Area 3', 'LGA Area 4'];
const FARM_TYPES = ['Crop Farming', 'Livestock', 'Mixed Farming', 'Aquaculture', 'Poultry'];
const CROP_LIVESTOCK_CHIPS = [
  'Rice', 'Maize', 'Cassava', 'Yam', 'Poultry', 'Catfish', 'Pepper', 'Tomato', 'Soybean', 'Goat', 'Cattle', 'Cocoa',
];

// ──────────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────────
interface GrantMatch {
  grantName: string;
  grantingOrganization: string;
  grantCategory: string;
  fundingBody?: string;
  description: string;
  fundingAmountRange: string;
  currency?: string;
  matchScore: number;
  matchReason: string;
  eligibilityCriteria?: string;
  requiredDocuments?: string[];
  applicationProcess?: string;
  applicationDeadline?: string;
  geographicScope?: string;
  applicationUrl?: string;
  contactInformation?: string;
}

interface LivePayload {
  body: Record<string, any>;
  sessionId?: string;
  jobId?: string;
}

interface PipelineSubmitResponse {
  jobId: string;
  applicationReference: string;
  status: string;
  estimatedWaitSeconds: number;
  message: string;
  farmerName: string;
}

// ──────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────
function getLgas(state: string) {
  return LGA_MAPPING[state] || DEFAULT_LGAS;
}

function safeStr(v: any, fallback = '') {
  if (v == null) return fallback;
  return typeof v === 'string' ? v.trim() : String(v).trim();
}

function safeArr(v: any): any[] {
  return Array.isArray(v) ? v : [];
}

// ──────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────
export default function HitlSandboxPage() {
  // ── TABS ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<number>(0);

  // ── LIVE PAYLOAD (from UiPath / SSE push) ─────────────────
  const [livePayload, setLivePayload] = useState<LivePayload | null>(null);
  const [payloadText, setPayloadText] = useState<string>('');
  const [payloadError, setPayloadError] = useState<string | null>(null);
  const [showPayloadEditor, setShowPayloadEditor] = useState(false);

  // ── PENDING HITL TASKS POLLING ───────────────────────────────
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const previousTasksCountRef = useRef(0);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${BACKEND}/api/hitl/tasks?status=Pending`);
        if (res.ok) {
          const data = await res.json();
          setPendingTasks(data.tasks || []);
          if (data.count > previousTasksCountRef.current && data.tasks.length > 0) {
            toast.info(`New UiPath task requires human input: ${data.tasks[0]?.title || 'Task'}`);
          }
          previousTasksCountRef.current = data.count;
        }
      } catch (err) {}
    };
    fetchTasks();
    const iv = setInterval(fetchTasks, 10000); // Poll every 10 seconds
    return () => clearInterval(iv);
  }, []);

  // ── JOB TRACKING ─────────────────────────────────────────
  const [jobId, setJobId] = useState<string | null>(null);
  const [appRef, setAppRef] = useState<string | null>(null);
  const [sseStatus, setSseStatus] = useState<'idle' | 'connecting' | 'live' | 'error'>('idle');
  const [sseEvents, setSseEvents] = useState<{ type: string; message: string; time: string }[]>([]);
  const sseRef = useRef<EventSource | null>(null);

  // ── FORM STATE ────────────────────────────────────────────
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', stateOfResidence: '', lgaOfResidence: '',
    preferredLanguage: 'English', isYouth: false, isWoman: false,
    farmState: '', farmLga: '', farmAddress: '', gpsCoords: '',
    farmType: '', cropsOrLivestock: [] as string[], farmSize: '', yearsOperation: '',
    annualRevenue: '', isSmallholder: false, hasBVN: false, bvnNumber: '',
    hasCAC: false, cacNumber: '', hasLandDoc: false, landDocType: '',
    isCooperativeMember: false, cooperativeName: '', noLoanDefault: false,
    hasBusinessPlan: false, businessPlanOption: '',
    fundingPurpose: '', requestedAmount: '', projectTitle: '', projectDescription: '',
    challenges: '', previousGrants: '',
    ninFile: null as File | null,
    cacFile: null as File | null,
    bankStatementFile: null as File | null,
    landDocFile: null as File | null,
    farmPhotoFile: null as File | null,
    businessPlanFile: null as File | null,
    passportFile: null as File | null,
  });

  // ── SUBMISSION STATE ──────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const markTaskCompleted = async (decision: string = 'approve') => {
    if (jobId && jobId.includes('-')) {
      await fetch(`${BACKEND}/api/hitl/tasks/backend/${jobId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision })
      }).catch(() => {});
      setPendingTasks(prev => prev.filter(t => t.task_id !== jobId));
    }
  };

  // ── INTAKE STEP ───────────────────────────────────────────
  const [intakeStep, setIntakeStep] = useState(1);

  // ── GRANT SELECTION ───────────────────────────────────────
  const [selectedGrantId, setSelectedGrantId] = useState<string>('');
  const [isConfirmingGrant, setIsConfirmingGrant] = useState(false);
  const [grantFilters, setGrantFilters] = useState({ category: 'All', search: '' });

  // ── DOCUMENT TOP-UP ───────────────────────────────────────
  const [topupFiles, setTopupFiles] = useState<Record<string, File | null>>({});
  const [isSubmittingDocs, setIsSubmittingDocs] = useState(false);
  const [docSubmitError, setDocSubmitError] = useState<string | null>(null);
  const [docSubmitSuccess, setDocSubmitSuccess] = useState(false);

  // ── PROPOSAL REVIEW ───────────────────────────────────────
  const [checklist, setChecklist] = useState({
    alignmentClear: true, budgetRealistic: true, languageProfessional: true,
    annexuresListed: true, noFabricatedFacts: true,
  });
  const [activeProposalSection, setActiveProposalSection] = useState<'cover' | 'letter' | 'description' | 'budget' | 'annexures'>('cover');
  const [proposalDecision, setProposalDecision] = useState<'approve' | 'revisions' | 'reject'>('approve');
  const [proposalComments, setProposalComments] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // ── REJECTION & APPEAL ────────────────────────────────────
  const [appealAction, setAppealAction] = useState<'appeal' | 'retry' | 'close'>('appeal');
  const [appealNotes, setAppealNotes] = useState('');
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  const [appealError, setAppealError] = useState<string | null>(null);

  // ──────────────────────────────────────────────────────────
  // DERIVED FROM LIVE PAYLOAD
  // ──────────────────────────────────────────────────────────
  const bodyData: Record<string, any> = livePayload?.body || {};
  const matchedGrants: GrantMatch[] = safeArr(bodyData.matchedGrants2 || bodyData.matchedGrants);
  const hasLivePayload = Object.keys(bodyData).length > 0;

  // Populate form from live payload whenever it arrives
  useEffect(() => {
    if (!hasLivePayload) return;
    const farmerName = safeStr(bodyData.farmerName || bodyData.farmerName6 || bodyData.farmerName3 || bodyData.farmerName5);
    const email = safeStr(bodyData.farmerEmail || bodyData.submissionContactEmail);
    const phone = safeStr(bodyData.submissionContactPhone || bodyData.vWsOu30vB);
    const state = safeStr(bodyData.stateOfResidence || bodyData.vdeqeWwcJ);
    const lga = safeStr(bodyData.lga);
    const address = safeStr(bodyData.vtZKCiqUt || bodyData.farmLocation);
    const farmTypeRaw = safeStr(bodyData.farmType || bodyData.vWmqTsDAG);
    const farmType = farmTypeRaw === 'mixed' ? 'Mixed Farming' : farmTypeRaw;
    const crops = safeArr(bodyData.vvf8WstMO).map((c: any) =>
      typeof c === 'string' ? c.charAt(0).toUpperCase() + c.slice(1) : ''
    ).filter(Boolean);
    const revenue = safeStr(bodyData.annualRevenueNgn ?? bodyData.vCBR7P2e5 ?? '');
    const experience = safeStr(bodyData.farmExperienceYears ?? bodyData.vG7Olrl0K ?? '');
    const amount = safeStr(bodyData.requestedAmount ?? bodyData.vCBR7P2e5 ?? '');
    const projectTitle = safeStr(bodyData.projectTittle || bodyData.projectTitle);
    const description = safeStr(bodyData.summary2 || bodyData.projectDescription);

    setFormData(prev => ({
      ...prev,
      fullName: farmerName || prev.fullName,
      email: email || prev.email,
      phone: phone || prev.phone,
      stateOfResidence: state || prev.stateOfResidence,
      lgaOfResidence: lga || prev.lgaOfResidence,
      farmState: state || prev.farmState,
      farmLga: lga || prev.farmLga,
      farmAddress: address || prev.farmAddress,
      farmType: farmType || prev.farmType,
      cropsOrLivestock: crops.length > 0 ? crops : prev.cropsOrLivestock,
      yearsOperation: experience || prev.yearsOperation,
      annualRevenue: revenue || prev.annualRevenue,
      requestedAmount: amount || prev.requestedAmount,
      projectTitle: projectTitle || prev.projectTitle,
      projectDescription: description || prev.projectDescription,
    }));

    if (bodyData.jobId && !jobId) setJobId(safeStr(bodyData.jobId));
  }, [livePayload]);

  // Auto-select first grant when grants load
  useEffect(() => {
    if (matchedGrants.length > 0 && !selectedGrantId) {
      setSelectedGrantId(matchedGrants[0].grantName || '');
    }
  }, [matchedGrants]);

  // ──────────────────────────────────────────────────────────
  // SSE: SUBSCRIBE TO PIPELINE EVENTS
  // ──────────────────────────────────────────────────────────
  const subscribeToEvents = useCallback((id: string) => {
    if (sseRef.current) sseRef.current.close();
    setSseStatus('connecting');

    const es = new EventSource(`${BACKEND}/api/pipeline/events/${id}`);
    sseRef.current = es;

    es.onopen = () => setSseStatus('live');

    es.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        setSseEvents(prev => [...prev, {
          type: data.type || 'event',
          message: data.message || evt.data,
          time: new Date().toLocaleTimeString('en-GB'),
        }]);
        // If the SSE push includes a full payload body, load it
        if (data.output && typeof data.output === 'object') {
          const incoming: LivePayload = { body: data.output, jobId: id };
          setLivePayload(incoming);
          setPayloadText(JSON.stringify({ body: data.output }, null, 2));
        }
      } catch { /* plain text event */ }
    };

    es.onerror = () => {
      setSseStatus('error');
      es.close();
    };

    return () => { es.close(); };
  }, []);

  useEffect(() => {
    if (jobId) return subscribeToEvents(jobId);
  }, [jobId]);

  // ──────────────────────────────────────────────────────────
  // MANUAL PAYLOAD EDITOR LOAD
  // ──────────────────────────────────────────────────────────
  const handleLoadPayload = () => {
    try {
      const parsed = JSON.parse(payloadText);
      // Accept both { body: {...} } and raw body objects
      const normalised: LivePayload = parsed.body ? parsed : { body: parsed };
      setLivePayload(normalised);
      setPayloadError(null);
      setShowPayloadEditor(false);
      if (normalised.body?.jobId) setJobId(safeStr(normalised.body.jobId));
    } catch (e: any) {
      setPayloadError(e.message || 'Invalid JSON');
    }
  };

  const handleClearPayload = () => {
    setLivePayload(null);
    setPayloadText('');
    setJobId(null);
    setAppRef(null);
    setSseStatus('idle');
    setSseEvents([]);
    setSelectedGrantId('');
    if (sseRef.current) sseRef.current.close();
  };

  // ──────────────────────────────────────────────────────────
  // GPS
  // ──────────────────────────────────────────────────────────
  const handleGPSLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setFormData(prev => ({
        ...prev, gpsCoords: `${pos.coords.latitude.toFixed(6)}° N, ${pos.coords.longitude.toFixed(6)}° E`,
      })),
      () => alert('Unable to read GPS. Please enter coordinates manually.'),
    );
  };

  // ──────────────────────────────────────────────────────────
  // FILE INPUT HELPER
  // ──────────────────────────────────────────────────────────
  const FileUploadSlot = ({
    label, fileKey, file, onSet, onClear,
  }: {
    label: string;
    fileKey: string;
    file: File | null;
    onSet: (f: File) => void;
    onClear: () => void;
  }) => {
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
  };

  // ──────────────────────────────────────────────────────────
  // SCREEN 0 — SUBMIT APPLICATION TO BACKEND
  // ──────────────────────────────────────────────────────────
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const submission = {
        farmerName: formData.fullName,
        farmerEmail: formData.email,
        farmerPhone: formData.phone,
        residentialAddress: formData.farmAddress,
        stateOfResidence: formData.stateOfResidence,
        lga: formData.lgaOfResidence,
        farmAddress: formData.farmAddress,
        farmType: formData.farmType || 'Mixed Farming',
        cropOrLivestockTypes: formData.cropsOrLivestock,
        farmSizeHectares: parseFloat(formData.farmSize) || 0,
        annualRevenueNGN: parseFloat(formData.annualRevenue) || 0,
        farmingExperienceYears: parseFloat(formData.yearsOperation) || 0,
        fundingPurpose: formData.fundingPurpose || 'Equipment',
        projectTitle: formData.projectTitle,
        projectDescription: formData.projectDescription,
        requestedAmount: parseFloat(formData.requestedAmount) || 0,
        farmingChallenges: formData.challenges,
        previousGrants: formData.previousGrants,
        isSmallholderFarmer: formData.isSmallholder,
        isYouthFarmer: formData.isYouth,
        isWomanFarmer: formData.isWoman,
        hasCACRegistration: formData.hasCAC,
        hasLandDocument: formData.hasLandDoc,
        isMemberOfCooperative: formData.isCooperativeMember,
        hasBVN: formData.hasBVN,
        hasNoLoanDefault: formData.noLoanDefault,
        additionalNotes: '',
        submissionMethod: 'online',
        submissionPortalUrl: PORTAL_URL,
        currentStatus: 'pending',
        documentsChecklist: '',
        agentAction: 'submit_application',
        preferredLanguage: formData.preferredLanguage,
      };

      const res = await fetch(`${BACKEND}/api/pipeline/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.detail?.message || err.message || `HTTP ${res.status}`);
      }

      const data: PipelineSubmitResponse = await res.json();
      setJobId(data.jobId);
      setAppRef(data.applicationReference);
      setSseEvents([{
        type: 'pipeline_started',
        message: `Application ${data.applicationReference} accepted. Tracking job ${data.jobId}.`,
        time: new Date().toLocaleTimeString('en-GB'),
      }]);
      setActiveTab(1); // Move to Grant Selection — grants will arrive via SSE
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed. Is the backend running?');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ──────────────────────────────────────────────────────────
  // SCREEN 1 — CONFIRM GRANT SELECTION → POST TO PORTAL
  // ──────────────────────────────────────────────────────────
  const handleGrantConfirm = async () => {
    if (!selectedGrantId) return;
    setIsConfirmingGrant(true);

    const selectedGrant = matchedGrants.find(g => g.grantName === selectedGrantId);
    const sessionId = safeStr(bodyData.sessionId || bodyData.sessionId2 || livePayload?.sessionId);

    try {
      // POST the farmer's grant selection back to the UiPath portal webhook
      const res = await fetch(PORTAL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authentication: 'manual',
          method: 'POST',
          url: PORTAL_URL,
          body: {
            ...bodyData,
            sessionId,
            grantName2: selectedGrantId,
            agentAction: 'grant_selected',
            agentAction4: 'prepare-submission-package',
            targetGrant: selectedGrantId,
            currentStatus: 'grant_selected',
            vCQgnY8KC: 'grant_selected',
          },
        }),
      });

      // Mark the task as completed in our DB
      await markTaskCompleted('grant_selected');

      // UiPath returns 200/202; network errors throw
      if (!res.ok && res.status !== 202) {
        console.warn(`Portal responded with ${res.status} — continuing anyway.`);
      }

      setActiveTab(2); // Move to Document Top-up
    } catch (err: any) {
      console.warn('Grant confirm portal call failed (proceeding):', err.message);
      setActiveTab(2);
    } finally {
      setIsConfirmingGrant(false);
    }
  };

  // ──────────────────────────────────────────────────────────
  // SCREEN 2 — SUBMIT DOCUMENT TOP-UP → POST TO BACKEND
  // ──────────────────────────────────────────────────────────
  const handleDocTopupSubmit = async () => {
    setIsSubmittingDocs(true);
    setDocSubmitError(null);
    setDocSubmitSuccess(false);

    try {
      // Upload files using multipart/form-data to the backend profile endpoint
      if (Object.values(topupFiles).some(f => f != null)) {
        const fd = new FormData();
        if (topupFiles.bankStatement) fd.append('bank_statement', topupFiles.bankStatement);
        if (topupFiles.ninDoc)        fd.append('nin_document', topupFiles.ninDoc);
        if (topupFiles.landDoc)       fd.append('land_document', topupFiles.landDoc);
        if (topupFiles.farmPhoto)     fd.append('farm_photo', topupFiles.farmPhoto);
        if (topupFiles.cac)           fd.append('cac_document', topupFiles.cac);

        const userId = safeStr(bodyData.userId2 || bodyData.sessionId);
        if (userId) {
          await fetch(`${BACKEND}/api/profile/upload-documents/${userId}`, {
            method: 'POST',
            body: fd,
          });
        }
      }

      // Notify the UiPath portal that docs are ready
      const sessionId = safeStr(bodyData.sessionId);
      await fetch(PORTAL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authentication: 'manual',
          method: 'POST',
          url: PORTAL_URL,
          body: {
            ...bodyData,
            sessionId,
            agentAction: 'documents_uploaded',
            currentStatus: 'documents_ready',
            vCQgnY8KC: 'documents_ready',
          },
        }),
      }).catch(() => { /* portal may not ack */ });

      await markTaskCompleted('documents_uploaded');
      setDocSubmitSuccess(true);
      setTimeout(() => setActiveTab(3), 1200);
    } catch (err: any) {
      setDocSubmitError(err.message || 'Document upload failed.');
    } finally {
      setIsSubmittingDocs(false);
    }
  };

  // ──────────────────────────────────────────────────────────
  // SCREEN 3 — PROPOSAL REVIEW DECISION → POST TO PORTAL
  // ──────────────────────────────────────────────────────────
  const handleProposalReview = async () => {
    setIsSubmittingReview(true);
    setReviewError(null);

    const sessionId = safeStr(bodyData.sessionId);
    const statusMap = { approve: 'proposal_approved', revisions: 'proposal_revisions', reject: 'proposal_rejected' };

    try {
      await fetch(PORTAL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authentication: 'manual',
          method: 'POST',
          url: PORTAL_URL,
          body: {
            ...bodyData,
            sessionId,
            agentAction: proposalDecision === 'approve' ? 'submit_application' : `request_${proposalDecision}`,
            comment: proposalComments,
            currentStatus: statusMap[proposalDecision],
            vCQgnY8KC: statusMap[proposalDecision],
            // Also pass back the QA checklist
            qualityChecks: checklist,
          },
        }),
      }).catch(() => { /* portal may not ack */ });

      await markTaskCompleted(proposalDecision);

      if (proposalDecision === 'approve') {
        setActiveTab(4);
      } else if (proposalDecision === 'revisions') {
        setSseEvents(prev => [...prev, {
          type: 'revisions_requested',
          message: 'Revisions requested — proposal looping back to Proposal Agent.',
          time: new Date().toLocaleTimeString('en-GB'),
        }]);
        setActiveTab(1);
      } else {
        setSseEvents(prev => [...prev, {
          type: 'pipeline_terminated',
          message: 'Application rejected by specialist. Pipeline terminated.',
          time: new Date().toLocaleTimeString('en-GB'),
        }]);
        setActiveTab(0);
      }
    } catch (err: any) {
      setReviewError(err.message || 'Review submission failed.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // ──────────────────────────────────────────────────────────
  // SCREEN 4 — APPEAL DECISION → POST TO PORTAL
  // ──────────────────────────────────────────────────────────
  const handleAppealDecision = async () => {
    setIsSubmittingAppeal(true);
    setAppealError(null);

    const sessionId = safeStr(bodyData.sessionId);
    const actionMap = {
      appeal: 'prepare_appeal',
      retry: 'retry_grant_selection',
      close: 'close_application',
    };

    try {
      await fetch(PORTAL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authentication: 'manual',
          method: 'POST',
          url: PORTAL_URL,
          body: {
            ...bodyData,
            sessionId,
            agentAction: actionMap[appealAction],
            comment: appealNotes,
            currentStatus: actionMap[appealAction],
            vCQgnY8KC: actionMap[appealAction],
          },
        }),
      }).catch(() => { /* portal may not ack */ });

      await markTaskCompleted(appealAction);

      setSseEvents(prev => [...prev, {
        type: `appeal_${appealAction}`,
        message: appealAction === 'appeal'
          ? 'Appeal filed — routing to task_prepare_appeal.'
          : appealAction === 'retry'
          ? 'Rejection accepted — routing back to grant selection.'
          : 'Application closed. Final reports logged.',
        time: new Date().toLocaleTimeString('en-GB'),
      }]);

      if (appealAction === 'appeal') setActiveTab(3);
      else if (appealAction === 'retry') setActiveTab(1);
      // close: stay on screen 4 — pipeline is done
    } catch (err: any) {
      setAppealError(err.message || 'Appeal submission failed.');
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  // ──────────────────────────────────────────────────────────
  // DOCUMENT ANALYSIS (payload-driven)
  // ──────────────────────────────────────────────────────────
  const payloadMissingDocs: string[] = safeArr(bodyData.missingDocuments || bodyData.missingCriticalDocuments);
  const selectedGrantObj = matchedGrants.find(g => g.grantName === selectedGrantId) || matchedGrants[0];
  const grantRequiredDocs: string[] = safeArr(selectedGrantObj?.requiredDocuments);
  const payloadChecklist: string[] = safeArr(bodyData.documentsChecklist2).length > 0
    ? safeArr(bodyData.documentsChecklist2)
    : grantRequiredDocs;
  const derivedMissing: string[] = payloadMissingDocs.length > 0
    ? payloadMissingDocs
    : payloadChecklist.filter(d => typeof d === 'string' && /outdated|expired|missing|update|renew/i.test(d));

  // ──────────────────────────────────────────────────────────
  // STATUS BADGE
  // ──────────────────────────────────────────────────────────
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

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <AuthGuard>
      <DashboardShell
        title="BPMN Human-in-the-Loop Portal"
        subtitle="5 screens mapped to Nigerian AgriGrant BPMN userTasks · Connected to live backend"
      >
        <div className="flex flex-col gap-6">

          {/* ── LIVE PAYLOAD PANEL ─────────────────────────────── */}
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

            {/* ── PENDING TASKS NOTIFICATION ─────────────────────────── */}
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

            {/* SSE Event Feed */}
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

          {/* ── STAGE NAVIGATOR ───────────────────────────────── */}
          <div className="w-full card-elevated p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                <Layers size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>Pipeline Stage Walkthrough</h3>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Each tab maps to a BPMN userTask.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: 0, label: 'Farmer Onboarding' },
                { id: 1, label: 'Grant Selection' },
                { id: 2, label: 'Document Top-up' },
                { id: 3, label: 'Proposal Review' },
                { id: 4, label: 'Rejection & Appeal' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                    activeTab === tab.id
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">{tab.id}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── NO PAYLOAD BANNER ─────────────────────────────── */}
          {!hasLivePayload && activeTab !== 0 && (
            <div className="card-elevated border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-amber-900 dark:text-amber-200">Waiting for live pipeline payload</p>
                <p className="text-amber-800 dark:text-amber-300 mt-1">
                  Submit the onboarding form (Screen 0) or paste a JSON payload above. Grant cards and form fields will appear once the pipeline responds.
                </p>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              SCREEN 0 — FARMER ONBOARDING & APPLICATION INTAKE
          ══════════════════════════════════════════════════ */}
          {activeTab === 0 && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                    Screen 0 — Application Intake
                  </span>
                  <h2 className="text-xl font-bold mt-1">Farmer Onboarding & Intake</h2>
                  <p className="text-sm text-muted-foreground">
                    Submits to <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded font-mono text-[10px]">POST {BACKEND}/api/pipeline/submit</code>
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="card-elevated p-6 space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Step {intakeStep} of 5</span>
                  <span>{Math.round((intakeStep / 5) * 100)}% Complete</span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 transition-all duration-300 rounded-full" style={{ width: `${(intakeStep / 5) * 100}%` }} />
                </div>
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] sm:text-xs text-muted-foreground pt-1 font-semibold">
                  {['1. Personal Info', '2. Farm Details', '3. Compliance', '4. Project', '5. Documents'].map((label, i) => (
                    <span key={i} className={intakeStep >= i + 1 ? 'text-emerald-700 font-bold' : ''}>{label}</span>
                  ))}
                </div>
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <XCircle size={14} /> {submitError}
                </div>
              )}

              <form onSubmit={handleOnboardingSubmit} className="card-elevated p-6 space-y-6">

                {/* ── Step 1: Personal Info ── */}
                {intakeStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <h3 className="text-base font-bold flex items-center gap-2 pb-2 border-b text-emerald-800" style={{ borderColor: 'var(--border)' }}>
                      <User size={18} /> Step 1: Personal Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label-base" htmlFor="fullName">Full Name</label>
                        <input id="fullName" type="text" className="input-base" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required />
                      </div>
                      <div>
                        <label className="label-base" htmlFor="email">Email Address</label>
                        <input id="email" type="email" className="input-base" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label-base" htmlFor="phone">Phone Number (+234 prefix)</label>
                        <input id="phone" type="tel" className="input-base" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                      </div>
                      <div>
                        <label className="label-base" htmlFor="language">Preferred Language</label>
                        <select id="language" className="input-base" value={formData.preferredLanguage} onChange={e => setFormData({ ...formData, preferredLanguage: e.target.value })}>
                          {['English', 'Hausa', 'Yoruba', 'Igbo', 'Pidgin'].map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label-base" htmlFor="state">State of Residence</label>
                        <select id="state" className="input-base" value={formData.stateOfResidence} onChange={e => setFormData({ ...formData, stateOfResidence: e.target.value, lgaOfResidence: '' })} required>
                          <option value="">Select State…</option>
                          {NIGERIAN_STATES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label-base" htmlFor="lga">LGA of Residence</label>
                        <select id="lga" className="input-base" value={formData.lgaOfResidence} onChange={e => setFormData({ ...formData, lgaOfResidence: e.target.value })} disabled={!formData.stateOfResidence} required>
                          <option value="">Select LGA…</option>
                          {formData.stateOfResidence && getLgas(formData.stateOfResidence).map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {[
                        { key: 'isYouth', label: 'Is Youth Farmer?', sub: 'Age 18–35 years old' },
                        { key: 'isWoman', label: 'Is Woman Farmer?', sub: 'Woman-led / woman-owned' },
                      ].map(({ key, label, sub }) => (
                        <div key={key} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20" style={{ borderColor: 'var(--border)' }}>
                          <div>
                            <span className="text-sm font-semibold block">{label}</span>
                            <span className="text-xs text-muted-foreground">{sub}</span>
                          </div>
                          <button type="button" onClick={() => setFormData({ ...formData, [key]: !(formData as any)[key] })}
                            className={`w-11 h-6 rounded-full transition-colors relative ${(formData as any)[key] ? 'bg-emerald-600' : 'bg-muted-foreground/30'}`}>
                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${(formData as any)[key] ? 'right-0.5' : 'left-0.5'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Step 2: Farm Information ── */}
                {intakeStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <h3 className="text-base font-bold flex items-center gap-2 pb-2 border-b text-emerald-800" style={{ borderColor: 'var(--border)' }}>
                      <Map size={18} /> Step 2: Farm Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label-base" htmlFor="farmState">Farm State</label>
                        <select id="farmState" className="input-base" value={formData.farmState} onChange={e => setFormData({ ...formData, farmState: e.target.value, farmLga: '' })} required>
                          <option value="">Select State…</option>
                          {NIGERIAN_STATES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label-base" htmlFor="farmLga">Farm LGA</label>
                        <select id="farmLga" className="input-base" value={formData.farmLga} onChange={e => setFormData({ ...formData, farmLga: e.target.value })} disabled={!formData.farmState} required>
                          <option value="">Select LGA…</option>
                          {formData.farmState && getLgas(formData.farmState).map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="label-base" htmlFor="farmAddress">Farm Address / Landmark</label>
                      <input id="farmAddress" type="text" className="input-base" value={formData.farmAddress} onChange={e => setFormData({ ...formData, farmAddress: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      <div className="sm:col-span-2">
                        <label className="label-base" htmlFor="gps">GPS Coordinates (Optional)</label>
                        <input id="gps" type="text" className="input-base font-mono text-sm" placeholder="e.g. 4.7758° N, 7.0154° E" value={formData.gpsCoords} onChange={e => setFormData({ ...formData, gpsCoords: e.target.value })} />
                      </div>
                      <button type="button" onClick={handleGPSLocation} className="flex items-center justify-center gap-1.5 px-4 py-2 border rounded-lg hover:bg-muted text-sm font-semibold transition-colors" style={{ minHeight: '44px', borderColor: 'var(--border)' }}>
                        <MapPin size={15} /> Use My Location
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label-base" htmlFor="farmType">Farm Type</label>
                        <select id="farmType" className="input-base" value={formData.farmType} onChange={e => setFormData({ ...formData, farmType: e.target.value })} required>
                          <option value="">Select Farm Type…</option>
                          {FARM_TYPES.map(ft => <option key={ft}>{ft}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label-base" htmlFor="farmSize">Farm Size (Hectares)</label>
                        <input id="farmSize" type="number" step="0.1" className="input-base" value={formData.farmSize} onChange={e => setFormData({ ...formData, farmSize: e.target.value, isSmallholder: parseFloat(e.target.value) < 5 })} required />
                      </div>
                    </div>
                    <div>
                      <label className="label-base">Crop or Livestock Types</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {CROP_LIVESTOCK_CHIPS.map(chip => {
                          const sel = formData.cropsOrLivestock.includes(chip);
                          return (
                            <button type="button" key={chip} onClick={() => setFormData({ ...formData, cropsOrLivestock: sel ? formData.cropsOrLivestock.filter(c => c !== chip) : [...formData.cropsOrLivestock, chip] })}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${sel ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border'}`}>
                              {chip}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label-base" htmlFor="yearsOp">Years in Operation</label>
                        <input id="yearsOp" type="number" className="input-base" value={formData.yearsOperation} onChange={e => setFormData({ ...formData, yearsOperation: e.target.value })} required />
                      </div>
                      <div>
                        <label className="label-base" htmlFor="revenue">Annual Revenue (NGN)</label>
                        <input id="revenue" type="number" className="input-base" value={formData.annualRevenue} onChange={e => setFormData({ ...formData, annualRevenue: e.target.value })} required />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 3: Compliance ── */}
                {intakeStep === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <h3 className="text-base font-bold flex items-center gap-2 pb-2 border-b text-emerald-800" style={{ borderColor: 'var(--border)' }}>
                      <Shield size={18} /> Step 3: Registration & Compliance
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {/* BVN */}
                      <div className="p-3 rounded-lg border bg-muted/20 space-y-3" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-semibold block">Has BVN?</span>
                            <span className="text-xs text-muted-foreground">Bank Verification Number</span>
                          </div>
                          <button type="button" onClick={() => setFormData({ ...formData, hasBVN: !formData.hasBVN })} className={`w-11 h-6 rounded-full transition-colors relative ${formData.hasBVN ? 'bg-emerald-600' : 'bg-muted-foreground/30'}`}>
                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${formData.hasBVN ? 'right-0.5' : 'left-0.5'}`} />
                          </button>
                        </div>
                        {formData.hasBVN && (
                          <div className="animate-in slide-in-from-top-2 duration-150">
                            <label className="label-base" htmlFor="bvn">11-Digit BVN</label>
                            <input id="bvn" type="text" maxLength={11} className="input-base font-mono" value={formData.bvnNumber} onChange={e => setFormData({ ...formData, bvnNumber: e.target.value })} required />
                          </div>
                        )}
                      </div>
                      {/* CAC */}
                      <div className="p-3 rounded-lg border bg-muted/20 space-y-3" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-semibold block">Has CAC Registration?</span>
                            <span className="text-xs text-muted-foreground">Corporate Affairs Commission</span>
                          </div>
                          <button type="button" onClick={() => setFormData({ ...formData, hasCAC: !formData.hasCAC })} className={`w-11 h-6 rounded-full transition-colors relative ${formData.hasCAC ? 'bg-emerald-600' : 'bg-muted-foreground/30'}`}>
                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${formData.hasCAC ? 'right-0.5' : 'left-0.5'}`} />
                          </button>
                        </div>
                        {formData.hasCAC && (
                          <div className="animate-in slide-in-from-top-2 duration-150">
                            <label className="label-base" htmlFor="cacNum">CAC Number (RC or BN)</label>
                            <input id="cacNum" type="text" className="input-base font-mono" value={formData.cacNumber} onChange={e => setFormData({ ...formData, cacNumber: e.target.value })} required />
                          </div>
                        )}
                      </div>
                      {/* Land Doc */}
                      <div className="p-3 rounded-lg border bg-muted/20 space-y-3" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-semibold block">Has Land Document?</span>
                            <span className="text-xs text-muted-foreground">Proof of land ownership/lease</span>
                          </div>
                          <button type="button" onClick={() => setFormData({ ...formData, hasLandDoc: !formData.hasLandDoc })} className={`w-11 h-6 rounded-full transition-colors relative ${formData.hasLandDoc ? 'bg-emerald-600' : 'bg-muted-foreground/30'}`}>
                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${formData.hasLandDoc ? 'right-0.5' : 'left-0.5'}`} />
                          </button>
                        </div>
                        {formData.hasLandDoc && (
                          <div className="animate-in slide-in-from-top-2 duration-150">
                            <label className="label-base" htmlFor="landDocType">Land Document Type</label>
                            <select id="landDocType" className="input-base" value={formData.landDocType} onChange={e => setFormData({ ...formData, landDocType: e.target.value })} required>
                              <option value="">Select Type…</option>
                              {['Certificate of Occupancy (C of O)', 'Right of Occupancy (R of O)', 'Family Land Deed', 'Lease Agreement'].map(t => <option key={t}>{t}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                      {/* Cooperative */}
                      <div className="p-3 rounded-lg border bg-muted/20 space-y-3" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-semibold block">Member of Cooperative?</span>
                            <span className="text-xs text-muted-foreground">Registered agricultural cooperative</span>
                          </div>
                          <button type="button" onClick={() => setFormData({ ...formData, isCooperativeMember: !formData.isCooperativeMember })} className={`w-11 h-6 rounded-full transition-colors relative ${formData.isCooperativeMember ? 'bg-emerald-600' : 'bg-muted-foreground/30'}`}>
                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${formData.isCooperativeMember ? 'right-0.5' : 'left-0.5'}`} />
                          </button>
                        </div>
                        {formData.isCooperativeMember && (
                          <div className="animate-in slide-in-from-top-2 duration-150">
                            <label className="label-base" htmlFor="coopName">Cooperative Name</label>
                            <input id="coopName" type="text" className="input-base" value={formData.cooperativeName} onChange={e => setFormData({ ...formData, cooperativeName: e.target.value })} required />
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Credit declaration */}
                    <div className="flex items-start gap-3 p-3 rounded-lg border bg-amber-50/40 border-amber-200 mt-2">
                      <input id="loanDefault" type="checkbox" className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 mt-0.5 cursor-pointer" checked={formData.noLoanDefault} onChange={e => setFormData({ ...formData, noLoanDefault: e.target.checked })} required />
                      <label htmlFor="loanDefault" className="text-xs text-amber-800 leading-relaxed cursor-pointer select-none">
                        <strong className="block font-semibold">Credit declaration</strong>
                        I declare that I do not have any active loan defaults registered on the CRMS Database.
                      </label>
                    </div>
                  </div>
                )}

                {/* ── Step 4: Project & Funding ── */}
                {intakeStep === 4 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <h3 className="text-base font-bold flex items-center gap-2 pb-2 border-b text-emerald-800" style={{ borderColor: 'var(--border)' }}>
                      <Briefcase size={18} /> Step 4: Project & Funding
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label-base" htmlFor="purpose">Funding Purpose</label>
                        <select id="purpose" className="input-base" value={formData.fundingPurpose} onChange={e => setFormData({ ...formData, fundingPurpose: e.target.value })} required>
                          <option value="">Select Purpose…</option>
                          {['Inputs (Seeds, Fertilizers)', 'Equipment Purchase', 'Farm Land Expansion', 'Agro-Processing & Packaging', 'Other Operational Funding'].map(p => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label-base" htmlFor="amount">Requested Amount (NGN)</label>
                        <input id="amount" type="number" className="input-base" value={formData.requestedAmount} onChange={e => setFormData({ ...formData, requestedAmount: e.target.value })} required />
                      </div>
                    </div>
                    <div>
                      <label className="label-base" htmlFor="projectTitle">Project Title</label>
                      <input id="projectTitle" type="text" className="input-base" value={formData.projectTitle} onChange={e => setFormData({ ...formData, projectTitle: e.target.value })} required />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="label-base" htmlFor="description">Proposed Project Description</label>
                        <span className="text-[10px] text-emerald-600 font-bold">{(formData.projectDescription || '').length} chars</span>
                      </div>
                      <textarea id="description" rows={4} className="input-base text-xs" value={formData.projectDescription} onChange={e => setFormData({ ...formData, projectDescription: e.target.value })} required />
                    </div>
                    <div>
                      <label className="label-base" htmlFor="challenges">Farming Challenges (Optional)</label>
                      <textarea id="challenges" rows={2} className="input-base text-xs" value={formData.challenges} onChange={e => setFormData({ ...formData, challenges: e.target.value })} />
                    </div>
                  </div>
                )}

                {/* ── Step 5: Documents ── */}
                {intakeStep === 5 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <h3 className="text-base font-bold flex items-center gap-2 pb-2 border-b text-emerald-800" style={{ borderColor: 'var(--border)' }}>
                      <FileCode size={18} /> Step 5: Document Upload
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FileUploadSlot label="🆔 NIN Slip / Voter Card *" fileKey="nin" file={formData.ninFile} onSet={f => setFormData({ ...formData, ninFile: f })} onClear={() => setFormData({ ...formData, ninFile: null })} />
                      {formData.hasCAC && <FileUploadSlot label="🏢 CAC Certificate *" fileKey="cac" file={formData.cacFile} onSet={f => setFormData({ ...formData, cacFile: f })} onClear={() => setFormData({ ...formData, cacFile: null })} />}
                      <FileUploadSlot label="🏦 Bank Statement (last 6 months) *" fileKey="bank" file={formData.bankStatementFile} onSet={f => setFormData({ ...formData, bankStatementFile: f })} onClear={() => setFormData({ ...formData, bankStatementFile: null })} />
                      {formData.hasLandDoc && <FileUploadSlot label={`📜 Land Document (${formData.landDocType}) *`} fileKey="land" file={formData.landDocFile} onSet={f => setFormData({ ...formData, landDocFile: f })} onClear={() => setFormData({ ...formData, landDocFile: null })} />}
                      <FileUploadSlot label="📸 Farm Photo *" fileKey="farmPhoto" file={formData.farmPhotoFile} onSet={f => setFormData({ ...formData, farmPhotoFile: f })} onClear={() => setFormData({ ...formData, farmPhotoFile: null })} />
                      <FileUploadSlot label="🖼️ Passport Photograph *" fileKey="passport" file={formData.passportFile} onSet={f => setFormData({ ...formData, passportFile: f })} onClear={() => setFormData({ ...formData, passportFile: null })} />
                    </div>
                    <div className="border-t pt-4 flex flex-col gap-4">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input type="checkbox" required className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 mt-0.5" />
                        <span className="text-xs text-muted-foreground leading-relaxed select-none">
                          I declare that all documents are valid and I authorize the AgriGrant AI pipelines to verify this payload with state and federal registers.
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Navigation Footer */}
                <div className="flex justify-between items-center border-t pt-4 mt-6" style={{ borderColor: 'var(--border)' }}>
                  {intakeStep > 1 ? (
                    <button type="button" onClick={() => setIntakeStep(p => p - 1)} className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-muted transition-colors" style={{ borderColor: 'var(--border)' }}>
                      Previous Step
                    </button>
                  ) : <div />}
                  {intakeStep < 5 ? (
                    <button type="button" onClick={() => setIntakeStep(p => p + 1)} className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5">
                      Next Step <ArrowRight size={13} />
                    </button>
                  ) : (
                    <button type="submit" disabled={isSubmitting} className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 text-white ${isSubmitting ? 'bg-emerald-400 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                      {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : 'Submit Application 🌱'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              SCREEN 1 — GRANT SELECTION (task_farmer_selects_grant)
          ══════════════════════════════════════════════════ */}
          {activeTab === 1 && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    Screen 1 — Grant Selection
                  </span>
                  <h2 className="text-xl font-bold mt-1">
                    {matchedGrants.length > 0
                      ? `We found ${matchedGrants.length} grants you may qualify for, ${formData.fullName || 'Farmer'} 🌱`
                      : 'Awaiting grant results from pipeline…'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    BPMN: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">task_farmer_selects_grant</code>
                  </p>
                </div>
                {selectedGrantId && (
                  <button
                    onClick={handleGrantConfirm}
                    disabled={isConfirmingGrant}
                    className={`px-5 py-2.5 rounded-lg text-xs font-bold text-white flex items-center gap-2 shadow-md ${isConfirmingGrant ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isConfirmingGrant ? <><Loader2 size={14} className="animate-spin" /> Confirming…</> : <>Confirm Grant & Continue <ArrowRight size={13} /></>}
                  </button>
                )}
              </div>

              {matchedGrants.length === 0 ? (
                <div className="text-center p-12 bg-slate-50 border rounded-xl">
                  <Loader2 size={32} className="animate-spin mx-auto text-slate-300 mb-3" />
                  <p className="text-sm font-semibold text-slate-500">Waiting for pipeline to return matched grants…</p>
                  <p className="text-xs text-slate-400 mt-1">Paste a JSON payload above or submit the onboarding form.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Filters */}
                  <div className="lg:col-span-1 card-elevated p-5 space-y-5 h-fit">
                    <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: 'var(--border)' }}>
                      <Sliders size={16} className="text-blue-600" />
                      <h4 className="font-bold text-xs uppercase tracking-wider">Filter Matches</h4>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase" htmlFor="search">Search</label>
                      <input id="search" type="text" placeholder="e.g. Tony, USAID…" className="input-base text-xs" value={grantFilters.search} onChange={e => setGrantFilters({ ...grantFilters, search: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase block">Category</label>
                      <div className="space-y-1.5">
                        {['All', 'private', 'state', 'federal', 'international', 'development-bank'].map(cat => (
                          <label key={cat} className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                            <input type="radio" name="grantCat" checked={grantFilters.category === cat} onChange={() => setGrantFilters({ ...grantFilters, category: cat })} />
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Grant Cards */}
                  <div className="lg:col-span-3 space-y-4">
                    {matchedGrants
                      .filter(g => {
                        if (!g) return false;
                        if (grantFilters.category !== 'All' && g.grantCategory !== grantFilters.category) return false;
                        if (grantFilters.search && !(g.grantName || '').toLowerCase().includes(grantFilters.search.toLowerCase())) return false;
                        return true;
                      })
                      .map((grant, idx) => {
                        const isSelected = selectedGrantId === grant.grantName;
                        return (
                          <div key={idx} className={`card-elevated p-5 border transition-all relative overflow-hidden ${isSelected ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20' : 'hover:border-slate-300'}`}>
                            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
                              <div className="absolute top-4 -right-8 w-28 bg-emerald-600 text-white text-[10px] font-bold text-center py-1 rotate-45">
                                {grant.matchScore}% Match
                              </div>
                            </div>
                            <div className="flex flex-col gap-4">
                              <div>
                                <span className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">{grant.grantCategory}</span>
                                <h3 className="font-bold text-base mt-1" style={{ color: 'var(--foreground)' }}>🏛️ {grant.grantName}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">By {grant.grantingOrganization}</p>
                              </div>
                              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{grant.description}</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                                <div>
                                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Funding Range</span>
                                  <span className="font-bold text-blue-600">{grant.fundingAmountRange}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Deadline</span>
                                  <span className="font-bold">{grant.applicationDeadline || 'Verify'}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Scope</span>
                                  <span className="font-bold capitalize">{grant.geographicScope || 'Nigeria'}</span>
                                </div>
                              </div>
                              <div className="p-3 bg-muted/30 rounded-lg text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                                <strong>Why this matches:</strong> {grant.matchReason}
                              </div>
                              {Array.isArray(grant.requiredDocuments) && (
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">Required Documents:</span>
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {grant.requiredDocuments.map((doc, i) => (
                                      <span key={i} className="inline-flex items-center gap-1 bg-slate-50 border px-2 py-0.5 rounded text-[10px] text-slate-700">
                                        <Check size={9} className="text-emerald-600" /> {doc}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center justify-between border-t pt-3 mt-1" style={{ borderColor: 'var(--border)' }}>
                                <a href={grant.applicationUrl || '#'} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                                  [ Link to Portal ↗ ]
                                </a>
                                <button
                                  type="button"
                                  onClick={() => setSelectedGrantId(grant.grantName || '')}
                                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-muted/60 text-muted-foreground hover:bg-muted'}`}
                                >
                                  {isSelected ? '✓ Grant Selected' : 'Select This Grant'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              SCREEN 2 — DOCUMENT TOP-UP (task_farmer_uploads_docs)
          ══════════════════════════════════════════════════ */}
          {activeTab === 2 && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                  Screen 2 — Document Upload Top-up
                </span>
                <h2 className="text-xl font-bold mt-1">
                  We need a few more documents for your <strong>{selectedGrantId || 'selected grant'}</strong> application
                </h2>
                <p className="text-sm text-muted-foreground">
                  BPMN: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">task_farmer_uploads_docs</code> — uploads go to <code className="bg-slate-100 px-1 rounded font-mono text-[10px]">{BACKEND}/api/profile/upload-documents</code>
                </p>
              </div>

              {docSubmitError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <XCircle size={14} /> {docSubmitError}
                </div>
              )}
              {docSubmitSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 size={14} /> Documents submitted! Moving to Proposal Review…
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left: checklist status */}
                <div className="lg:col-span-1 card-elevated p-5 space-y-4 h-fit">
                  <h4 className="font-bold text-xs uppercase tracking-wider pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
                    Trust Vault Status
                  </h4>
                  <div className="space-y-3">
                    {payloadChecklist.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground italic">No checklist from Document Understanding Agent yet.</p>
                    ) : (
                      payloadChecklist.map((doc, idx) => {
                        const isMissing = derivedMissing.some(m => typeof m === 'string' && m.toLowerCase().includes(String(doc).toLowerCase().slice(0, 10)));
                        return (
                          <div key={idx} className={`flex items-center gap-2 text-xs font-medium ${isMissing ? 'text-amber-600' : 'text-emerald-700'}`}>
                            {isMissing ? <AlertTriangle size={14} className="flex-shrink-0" /> : <CheckCircle2 size={14} className="flex-shrink-0" />}
                            <span className="truncate" title={doc}>{doc} {isMissing ? '(Needs Update)' : '(Verified)'}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right: upload slots */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="card-elevated p-6 space-y-4">
                    <h3 className="font-bold text-sm text-amber-700">Required Document Uploads</h3>
                    <p className="text-xs text-muted-foreground">
                      Upload any flagged or missing documents below. Accepted: PDF, JPG, PNG, DOC.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FileUploadSlot label="🏦 Updated Bank Statement (last 6 months) *" fileKey="bankStatement" file={topupFiles.bankStatement || null} onSet={f => setTopupFiles(p => ({ ...p, bankStatement: f }))} onClear={() => setTopupFiles(p => ({ ...p, bankStatement: null }))} />
                      <FileUploadSlot label="🆔 NIN / Identity Document" fileKey="ninDoc" file={topupFiles.ninDoc || null} onSet={f => setTopupFiles(p => ({ ...p, ninDoc: f }))} onClear={() => setTopupFiles(p => ({ ...p, ninDoc: null }))} />
                      <FileUploadSlot label="📜 Land Document (updated)" fileKey="landDoc" file={topupFiles.landDoc || null} onSet={f => setTopupFiles(p => ({ ...p, landDoc: f }))} onClear={() => setTopupFiles(p => ({ ...p, landDoc: null }))} />
                      <FileUploadSlot label="📸 Farm Photo" fileKey="farmPhoto" file={topupFiles.farmPhoto || null} onSet={f => setTopupFiles(p => ({ ...p, farmPhoto: f }))} onClear={() => setTopupFiles(p => ({ ...p, farmPhoto: null }))} />
                      {formData.hasCAC && <FileUploadSlot label="🏢 CAC Certificate" fileKey="cac" file={topupFiles.cac || null} onSet={f => setTopupFiles(p => ({ ...p, cac: f }))} onClear={() => setTopupFiles(p => ({ ...p, cac: null }))} />}
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                    <button type="button" onClick={() => setActiveTab(1)} className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-muted" style={{ borderColor: 'var(--border)' }}>
                      Back to Selection
                    </button>
                    <button
                      type="button"
                      onClick={handleDocTopupSubmit}
                      disabled={isSubmittingDocs || docSubmitSuccess}
                      className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 text-white ${isSubmittingDocs ? 'bg-emerald-400 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700 shadow-md active:scale-95'}`}
                    >
                      {isSubmittingDocs ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : <>Submit Documents <ArrowRight size={13} /></>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              SCREEN 3 — PROPOSAL REVIEW (task_proposal_review_hitl)
          ══════════════════════════════════════════════════ */}
          {activeTab === 3 && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                  Screen 3 — Proposal Review (Internal Specialist)
                </span>
                <h2 className="text-xl font-bold mt-1">Proposal Quality Review Dashboard</h2>
                <p className="text-sm text-muted-foreground">
                  BPMN: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">task_proposal_review_hitl</code> — decision POSTs to <code className="bg-slate-100 px-1 rounded font-mono text-[10px]">{PORTAL_URL}</code>
                </p>
              </div>

              {reviewError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <XCircle size={14} /> {reviewError}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Proposal Document */}
                <div className="lg:col-span-7 card-elevated p-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 min-h-[500px] max-h-[650px] overflow-y-auto font-serif relative">
                  <div className="flex border-b font-sans text-xs mb-6 overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
                    {[
                      { id: 'cover', label: '1. Cover Page' },
                      { id: 'letter', label: '2. Application Letter' },
                      { id: 'description', label: '3. Project Description' },
                      { id: 'budget', label: '4. Budget' },
                      { id: 'annexures', label: '5. Annexures' },
                    ].map(sec => (
                      <button key={sec.id} type="button" onClick={() => setActiveProposalSection(sec.id as any)}
                        className={`px-3 py-2 border-b-2 font-semibold transition-all whitespace-nowrap ${activeProposalSection === sec.id ? 'border-emerald-600 text-emerald-700 bg-white dark:bg-slate-800' : 'border-transparent text-muted-foreground hover:bg-muted/40'}`}>
                        {sec.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4 text-slate-800 dark:text-slate-200">
                    {activeProposalSection === 'cover' && (
                      <div className="text-center py-10 space-y-6">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-2xl">🏛️</div>
                        <div className="space-y-2">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 font-sans">Business Proposal Document</p>
                          <h1 className="text-2xl font-extrabold tracking-tight font-sans text-emerald-800 dark:text-emerald-500">
                            {formData.projectTitle || safeStr(bodyData.projectTittle) || '—'}
                          </h1>
                          <p className="text-sm font-sans italic text-slate-600">Submitted for {selectedGrantId || '—'}</p>
                        </div>
                        <div className="pt-8 text-xs space-y-1 font-sans text-slate-500 text-left max-w-sm mx-auto border-t font-semibold">
                          <p><strong>Applicant:</strong> {formData.fullName || safeStr(bodyData.farmerName6)}</p>
                          <p><strong>Farm Type:</strong> {formData.farmType || safeStr(bodyData.farmType)}</p>
                          <p><strong>Location:</strong> {formData.farmAddress || safeStr(bodyData.vtZKCiqUt)}</p>
                          <p><strong>Requested Funding:</strong> ₦{(parseInt(formData.requestedAmount || '0') || 0).toLocaleString()}</p>
                          <p><strong>Date Generated:</strong> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                      </div>
                    )}
                    {activeProposalSection === 'letter' && (
                      <div className="space-y-4 text-xs font-sans text-slate-700 dark:text-slate-300 px-4">
                        <div className="text-right">
                          <p>{formData.fullName || safeStr(bodyData.farmerName6)}</p>
                          <p>{formData.farmAddress || safeStr(bodyData.vtZKCiqUt)}</p>
                          <p>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="text-left font-bold">
                          <p>To: The Coordinator,</p>
                          <p>{selectedGrantId || '—'},</p>
                          <p>{formData.stateOfResidence || safeStr(bodyData.stateOfResidence)} State Regional Office.</p>
                        </div>
                        <p className="font-bold text-center border-b pb-1">
                          SUBJECT: APPLICATION FOR FUNDING — '{(formData.projectTitle || '').toUpperCase()}'
                        </p>
                        <p>Dear Sir/Ma,</p>
                        <p className="leading-relaxed">
                          I am writing to formally submit our application under the {selectedGrantId || '—'}. As a smallholder crop farmer operating {formData.farmSize || '—'} hectares in {formData.lgaOfResidence || '—'} LGA, {formData.stateOfResidence || '—'} State, my farm specialises in {formData.cropsOrLivestock.join(', ') || safeArr(bodyData.vvf8WstMO).join(', ')}.
                        </p>
                        <p className="leading-relaxed">
                          The primary purpose of this request is for <strong>{formData.fundingPurpose || '—'}</strong> to scale production and expand operations.
                        </p>
                        <p className="pt-4">Yours Faithfully,</p>
                        <p className="font-bold underline">{formData.fullName || safeStr(bodyData.farmerName6)}</p>
                      </div>
                    )}
                    {activeProposalSection === 'description' && (
                      <div className="space-y-4 text-xs leading-relaxed px-4">
                        <h4 className="font-sans font-bold text-sm text-emerald-800">1. Project Intent & Scope</h4>
                        <p>{formData.projectDescription || safeStr(bodyData.summary2) || '—'}</p>
                        <h4 className="font-sans font-bold text-sm text-emerald-800 mt-4">2. Operations Challenges Addressed</h4>
                        <p>{formData.challenges || safeStr(bodyData.farmingChallenges) || '—'}</p>
                      </div>
                    )}
                    {activeProposalSection === 'budget' && (
                      <div className="space-y-4 px-4">
                        <h4 className="font-sans font-bold text-sm text-emerald-800">Project Financial Breakdown</h4>
                        <table className="w-full text-left text-xs font-sans border-collapse">
                          <thead>
                            <tr className="border-b bg-slate-100">
                              <th className="p-2 font-bold">Item</th>
                              <th className="p-2 font-bold">Qty</th>
                              <th className="p-2 font-bold text-right">Cost (NGN)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { item: 'Production Inputs & Aggregates', qty: 'Bulk', pct: 0.4 },
                              { item: 'Equipment Infrastructure', qty: 'Units', pct: 0.4 },
                              { item: 'Transport & Logistics', qty: 'Aggregate', pct: 0.2 },
                            ].map(({ item, qty, pct }) => (
                              <tr key={item} className="border-b">
                                <td className="p-2">{item}</td>
                                <td className="p-2">{qty}</td>
                                <td className="p-2 text-right">₦{Math.round((parseInt(formData.requestedAmount || '0') || 0) * pct).toLocaleString()}</td>
                              </tr>
                            ))}
                            <tr className="font-bold">
                              <td className="p-2" colSpan={2}>Total Estimated Project Cost</td>
                              <td className="p-2 text-right text-emerald-700">₦{(parseInt(formData.requestedAmount || '0') || 0).toLocaleString()}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                    {activeProposalSection === 'annexures' && (
                      <div className="space-y-4 text-xs font-sans px-4">
                        <h4 className="font-sans font-bold text-sm text-emerald-800">Verified Payload Annexures</h4>
                        <div className="space-y-2">
                          {[
                            { label: 'NIN Identity Document', value: formData.ninFile?.name },
                            { label: 'Bank Statement (Updated)', value: topupFiles.bankStatement?.name || formData.bankStatementFile?.name },
                            { label: 'Land Document', value: topupFiles.landDoc?.name || formData.landDocFile?.name },
                            { label: 'Farm Photo', value: topupFiles.farmPhoto?.name || formData.farmPhotoFile?.name },
                          ].map(({ label, value }) => (
                            <div key={label} className="p-2 rounded border flex items-center justify-between">
                              <span className="font-semibold text-slate-700">{label}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${value ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                {value || 'Not uploaded'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Reviewer Controls */}
                <div className="lg:col-span-5 card-elevated p-6 space-y-5">
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
                      QA Checks (AI-Assisted)
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-1">Pre-analyzed by the Validation Agent. Toggle to override.</p>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { key: 'alignmentClear', label: 'Grant Alignment Clear' },
                      { key: 'budgetRealistic', label: 'Budget Realistic & Justified' },
                      { key: 'languageProfessional', label: 'Language & Grammar Professional' },
                      { key: 'annexuresListed', label: 'All Supporting Annexures Present' },
                      { key: 'noFabricatedFacts', label: 'No Fabricated Facts / Hallucinations' },
                    ].map(chk => (
                      <label key={chk.key} className="flex items-center justify-between p-2 rounded-lg border text-xs font-semibold cursor-pointer hover:bg-muted/30 select-none">
                        <span>{chk.label}</span>
                        <input type="checkbox" checked={(checklist as any)[chk.key]} onChange={() => setChecklist(p => ({ ...p, [chk.key]: !(p as any)[chk.key] }))} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                      </label>
                    ))}
                  </div>
                  <div className="space-y-2 pt-2">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase block">Decision Action</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'approve', label: 'Approve', icon: <CheckCircle2 size={16} className="text-emerald-600" />, color: 'border-emerald-500 bg-emerald-50/50 text-emerald-800' },
                        { id: 'revisions', label: 'Revisions', icon: <FileSignature size={16} className="text-amber-600" />, color: 'border-amber-500 bg-amber-50/50 text-amber-800' },
                        { id: 'reject', label: 'Reject', icon: <XCircle size={16} className="text-red-600" />, color: 'border-red-500 bg-red-50/50 text-red-800' },
                      ].map(opt => (
                        <button key={opt.id} type="button" onClick={() => setProposalDecision(opt.id as any)}
                          className={`p-2.5 border rounded-lg text-center flex flex-col items-center justify-center gap-1 transition-all ${proposalDecision === opt.id ? `${opt.color} shadow-sm ring-1 ring-current/20` : 'hover:bg-muted/40'}`}>
                          {opt.icon}
                          <span className="text-[10px] font-bold">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase" htmlFor="comments">Reviewer Comments</label>
                    <textarea id="comments" rows={3} className="input-base text-xs" value={proposalComments} onChange={e => setProposalComments(e.target.value)} placeholder="Add your review notes here…" />
                  </div>
                  <button type="button" onClick={handleProposalReview} disabled={isSubmittingReview}
                    className={`w-full py-2.5 rounded-lg text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-1.5 ${
                      isSubmittingReview ? 'bg-slate-400 cursor-wait' :
                      proposalDecision === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' :
                      proposalDecision === 'revisions' ? 'bg-amber-600 hover:bg-amber-700' :
                      'bg-red-600 hover:bg-red-700'}`}>
                    {isSubmittingReview ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : <>Submit Review Decision <ArrowRight size={13} /></>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              SCREEN 4 — REJECTION & APPEAL (task_specialist_reviews_rejection)
          ══════════════════════════════════════════════════ */}
          {activeTab === 4 && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 animate-pulse">
                  Screen 4 — Rejection & Appeal
                </span>
                <h2 className="text-xl font-bold mt-1">Application Rejected by Portal</h2>
                <p className="text-sm text-muted-foreground">
                  BPMN: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">task_specialist_reviews_rejection</code> — decision POSTs to <code className="bg-slate-100 px-1 rounded font-mono text-[10px]">{PORTAL_URL}</code>
                </p>
              </div>

              {appealError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <XCircle size={14} /> {appealError}
                </div>
              )}

              {/* Rejection Summary */}
              <div className="card-elevated p-6 border-l-4 border-red-500 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 font-mono">RPA Portal Log Scraper Output</span>
                    <h3 className="font-bold text-base mt-1" style={{ color: 'var(--foreground)' }}>
                      {selectedGrantId || (matchedGrants[0]?.grantName) || 'Selected Grant'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Rejection Reference: <span className="font-mono font-bold">REJ-{safeStr(bodyData.jobId) || appRef || 'pending'}</span>
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg flex flex-col items-center font-semibold">
                    <span className="text-2xl font-bold font-mono">
                      {bodyData.recommendations?.recoverabilityScore ?? bodyData.overallEligibilityScore ?? '—'} / 10
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-red-600">Recoverability</span>
                  </div>
                </div>
                <div className="p-3.5 bg-red-50/50 text-red-800 text-xs rounded-lg border border-red-200 leading-relaxed font-mono">
                  <strong>RPA Scraped Reason:</strong> "{safeStr(bodyData.rejectionResponse || bodyData.analystNarrative) || 'No rejection reason captured by the RPA scraper yet.'}"
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Recommendation */}
                <div className="card-elevated p-5 space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider pb-2 border-b flex items-center gap-1.5" style={{ borderColor: 'var(--border)' }}>
                    <Sparkles size={14} className="text-emerald-600" /> AI Appeal Recommendation
                  </h4>
                  <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    <p>{safeStr(bodyData.analystNarrative) || 'The Validation Agent has assessed the rejection. Review the suggested grounds below before deciding whether to file an appeal.'}</p>
                    <div className="space-y-1.5 font-semibold">
                      <strong className="block text-slate-600">Profile gaps (from pipeline):</strong>
                      {safeArr(bodyData.profileGaps2).length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {safeArr(bodyData.profileGaps2).map((gap: string, i: number) => <li key={i}>{gap}</li>)}
                        </ul>
                      ) : (
                        <p className="italic text-muted-foreground font-normal">No profile gaps surfaced.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Specialist Action */}
                <div className="card-elevated p-5 space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
                    Specialist Action Panel
                  </h4>
                  <div className="space-y-2">
                    {[
                      { id: 'appeal', label: 'File Appeal', sub: 'Routes to task_prepare_appeal' },
                      { id: 'retry', label: 'Accept Rejection, Try Different Grant', sub: 'Loops back to task_present_options' },
                      { id: 'close', label: 'Accept Rejection, Close Application', sub: 'Ends pipeline execution' },
                    ].map(opt => (
                      <label key={opt.id} className="flex items-center gap-2.5 p-3 rounded-lg border text-xs font-semibold cursor-pointer hover:bg-muted/30 select-none">
                        <input type="radio" name="appealAction" checked={appealAction === opt.id as any} onChange={() => setAppealAction(opt.id as any)} />
                        <div>
                          <span className="block">{opt.label}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">{opt.sub}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase" htmlFor="actionNotes">Notes / Directives</label>
                    <textarea id="actionNotes" rows={3} className="input-base text-xs" value={appealNotes} onChange={e => setAppealNotes(e.target.value)} placeholder="Add specialist directives here…" />
                  </div>
                  <button type="button" onClick={handleAppealDecision} disabled={isSubmittingAppeal}
                    className={`w-full py-2.5 rounded-lg text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-1.5 ${
                      isSubmittingAppeal ? 'bg-slate-400 cursor-wait' :
                      appealAction === 'appeal' ? 'bg-blue-600 hover:bg-blue-700' :
                      appealAction === 'retry' ? 'bg-amber-600 hover:bg-amber-700' :
                      'bg-red-600 hover:bg-red-700'}`}>
                    {isSubmittingAppeal ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : <>Submit Decision <ArrowRight size={13} /></>}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
