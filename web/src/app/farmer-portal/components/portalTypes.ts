// Shared types for the Farmer Portal

export type PortalPage = 'form' | 'processing' | 'results';

export type FarmType =
  | 'Crop Farming'
  | 'Livestock'
  | 'Poultry'
  | 'Fishery'
  | 'Mixed Farming'
  | 'Agro-processing'
  | 'Horticulture'
  | 'Cooperative'
  | 'Agribusiness'
  | 'Others'
  | 'Other';

export const NIGERIAN_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
];

export const FARM_TYPES: FarmType[] = [
  'Crop Farming',
  'Livestock',
  'Poultry',
  'Fishery',
  'Mixed Farming',
  'Agro-processing',
  'Horticulture',
  'Cooperative',
  'Agribusiness',
  'Others',
];

export const CROPS_LIVESTOCK = [
  'Rice',
  'Maize',
  'Cassava',
  'Yam',
  'Poultry',
  'Catfish',
  'Cattle',
  'Goat',
  'Soybean',
  'Tomato',
  'Pepper',
  'Others',
];

export const LIVESTOCK_RELATED: Record<string, string[]> = {
  Livestock: ['Cattle', 'Goat'],
  Poultry: ['Poultry'],
  Fishery: ['Catfish'],
};

export interface FarmerFormData {
  // Section A — Basic Info
  farmerName: string;
  farmerEmail: string;
  farmerPhone: string;
  residentialAddress: string;
  stateOfResidence: string;
  lga: string;
  farmAddress: string;
  farmType: FarmType | '';
  cropOrLivestockTypes: string[];
  // Section B — Farm Details
  farmSizeHectares: number | '';
  annualRevenueNGN: number | '';
  farmingExperienceYears: number | '';
  fundingPurpose: string;
  projectTitle: string;
  projectDescription: string;
  requestedAmount: number | '';
  farmingChallenges: string;
  previousGrants: string;
  // Section C — Profile Flags
  isSmallholderFarmer: boolean;
  isYouthFarmer: boolean;
  isWomanFarmer: boolean;
  hasCACRegistration: boolean;
  hasLandDocument: boolean;
  isMemberOfCooperative: boolean;
  hasBVN: boolean;
  hasNoLoanDefault: boolean;
  // Section D — Additional Notes
  additionalNotes: string;
  // Section E — Documents
  ninDocument: string | null;
  cacDocument: string | null;
  bankStatement: string | null;
  landDocument: string | null;
}

export const defaultFormData: FarmerFormData = {
  farmerName: '',
  farmerEmail: '',
  farmerPhone: '',
  residentialAddress: '',
  stateOfResidence: '',
  lga: '',
  farmAddress: '',
  farmType: '',
  cropOrLivestockTypes: [],
  farmSizeHectares: '',
  annualRevenueNGN: '',
  farmingExperienceYears: '',
  fundingPurpose: '',
  projectTitle: '',
  projectDescription: '',
  requestedAmount: '',
  farmingChallenges: '',
  previousGrants: '',
  isSmallholderFarmer: false,
  isYouthFarmer: false,
  isWomanFarmer: false,
  hasCACRegistration: false,
  hasLandDocument: false,
  isMemberOfCooperative: false,
  hasBVN: false,
  hasNoLoanDefault: true,
  additionalNotes: '',
  ninDocument: null,
  cacDocument: null,
  bankStatement: null,
  landDocument: null,
};

export interface MatchedGrant {
  grantName: string;
  grantingOrganization: string;
  matchScore: number;
  fundingAmountRange: string;
  applicationDeadline: string;
  matchReason: string;
  grantCategory: string;
  applicationUrl: string;
}

export interface PipelineOutput {
  matchedGrants: MatchedGrant[];
  profileGaps: string[];
  topRecommendation: string;
  summary: string;
  disclaimer: string;
  totalMatchesFound: number;
  farmerName: string;
  stateOfResidence: string;
  eligibilityScore?: number;
  trustScore?: number;
  trustScoreBreakdown?: { item: string; points: number; status: string }[];
  applicationLetterText?: string;
  submissionInstructions?: string;
  followUpSchedule?: string;
  hiddenGrantsCount?: number;
  error?: string;
}
