export const offeringStages = [
  "planned",
  "announcement_open",
  "special_supply_open",
  "priority_1_open",
  "priority_2_open",
  "winner_announced",
  "contract_open",
  "move_in_pending",
  "closed",
] as const;

export type OfferingStage = (typeof offeringStages)[number];

export const scheduleEventTypes = [
  "announcement",
  "special_supply",
  "priority_1",
  "priority_2",
  "winner_announcement",
  "contract",
  "move_in",
] as const;

export type ScheduleEventType = (typeof scheduleEventTypes)[number];

export type OfferingType = "private_sale" | "public_sale";
export type SaleCategory = "apt" | "officetel" | "public_housing";
export type SupplyKind = "general" | "special";
export type SpecialSupplyType =
  | "newlywed"
  | "first_time_buyer"
  | "multi_child"
  | "elder_support"
  | "institution_recommendation";
export type ScheduleStatus = "upcoming" | "ongoing" | "completed";
export type SpeculationZoneType =
  | "speculation_overheated"
  | "adjustment_target"
  | "non_regulated";

export interface ScheduleEvent {
  id: string;
  eventType: ScheduleEventType;
  startsAt: string;
  endsAt?: string;
  displayLabel: string;
  status: ScheduleStatus;
}

export interface HousingType {
  id: string;
  typeName: string;
  exclusiveAreaM2: number;
  supplyHouseholdsTotal: number;
  supplyHouseholdsGeneral: number;
  supplyHouseholdsSpecial: number;
  salePriceMin: number;
  salePriceMax: number;
  contractDepositRate: number;
  middlePaymentRate: number;
  balanceRate: number;
  optionPriceNote?: string;
}

export interface SupplyRule {
  id: string;
  supplyKind: SupplyKind;
  specialSupplyType?: SpecialSupplyType;
  residentRegionRule: string;
  homelessRequired: boolean;
  headOfHouseholdRequired: boolean;
  subscriptionAccountRequired: boolean;
  subscriptionMinPeriodMonths: number;
  incomeRuleText?: string;
  assetRuleText?: string;
  noteText?: string;
}

export interface RegulationInfo {
  priceCapApplied: boolean;
  resaleRestrictionMonths: number;
  resaleRestrictionNote: string;
  residencyObligationMonths: number;
  rewinRestrictionYears: number;
  speculationZoneType: SpeculationZoneType;
  interimLoanAvailable: boolean;
  interimLoanNote: string;
}

export interface CompetitionRate {
  id: string;
  typeName: string;
  supplyKind: SupplyKind;
  specialSupplyType?: SpecialSupplyType;
  recruitmentCount: number;
  applicantCount: number;
  competitionRatio: number;
  minWinningScore?: number;
  maxWinningScore?: number;
  avgWinningScore?: number;
}

export interface OfferingSummary {
  id: string;
  complexName: string;
  slug: string;
  regionLabel: string;
  addressFull: string;
  latitude: number;
  longitude: number;
  offeringType: OfferingType;
  saleCategory: SaleCategory;
  currentStage: OfferingStage;
  announcementName: string;
  announcementDate: string;
  moveInPlannedAt: string;
  dataCheckedAt: string;
  totalHouseholds: number;
  developerName: string;
  builderName: string;
  supplySummary: string;
  summaryText: string;
  minSalePrice: number;
  maxSalePrice: number;
  areaRangeLabel: string;
  nextScheduleLabel: string;
  nextScheduleAt: string;
}

export interface OfferingDetail extends OfferingSummary {
  housingTypes: HousingType[];
  scheduleEvents: ScheduleEvent[];
  supplyRules: SupplyRule[];
  regulationInfo: RegulationInfo;
  competitionRates: CompetitionRate[];
  noticeHighlights: string[];
  locationHighlights: string[];
}

export interface OfferingsFilter {
  stages?: OfferingStage[];
  region?: string;
  offeringType?: OfferingType;
  maxPrice?: number;
  minArea?: number;
  specialSupplyType?: SpecialSupplyType;
}

export interface UserProfile {
  residenceRegion1: string;
  residenceRegion2?: string;
  isHomeless: boolean;
  isHeadOfHousehold: boolean;
  hasSubscriptionAccount: boolean;
  subscriptionPeriodMonths: number;
  specialSupplyFlags: SpecialSupplyType[];
  budgetMax?: number;
}

export interface EligibilityResult {
  eligibleSupplyTypes: string[];
  cautions: string[];
  requiresReview: string[];
}

export interface ScoreInput {
  homelessPeriodYears: number;
  dependentCount: number;
  subscriptionPeriodYears: number;
}

export interface ScoreResult {
  homelessScore: number;
  dependentScore: number;
  subscriptionScore: number;
  totalScore: number;
  assessmentLabel: string;
}
