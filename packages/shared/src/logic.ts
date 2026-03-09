import { mockOfferings } from "./mock-data";
import type {
  EligibilityResult,
  OfferingDetail,
  OfferingStage,
  OfferingsFilter,
  ScoreInput,
  ScoreResult,
  SpecialSupplyType,
  UserProfile,
} from "./types";

const stageLabels: Record<OfferingStage, string> = {
  planned: "분양 예정",
  announcement_open: "공고 공개",
  special_supply_open: "특별공급 진행",
  priority_1_open: "1순위 접수",
  priority_2_open: "2순위 접수",
  winner_announced: "당첨자 발표",
  contract_open: "계약 진행",
  move_in_pending: "입주 예정",
  closed: "종료",
};

export function getStageLabel(stage: OfferingStage): string {
  return stageLabels[stage];
}

export function getActionableStages(): OfferingStage[] {
  return ["special_supply_open", "priority_1_open", "priority_2_open"];
}

export function listOfferings(filters: OfferingsFilter = {}): OfferingDetail[] {
  return mockOfferings.filter((offering) => {
    if (filters.stages?.length && !filters.stages.includes(offering.currentStage)) {
      return false;
    }

    if (
      filters.region &&
      !`${offering.regionLabel} ${offering.addressFull}`.includes(filters.region)
    ) {
      return false;
    }

    if (filters.offeringType && offering.offeringType !== filters.offeringType) {
      return false;
    }

    if (filters.maxPrice && offering.minSalePrice > filters.maxPrice) {
      return false;
    }

    if (
      filters.minArea &&
      !offering.housingTypes.some((item) => item.exclusiveAreaM2 >= filters.minArea!)
    ) {
      return false;
    }

    if (
      filters.specialSupplyType &&
      !offering.supplyRules.some(
        (rule) => rule.specialSupplyType === filters.specialSupplyType,
      )
    ) {
      return false;
    }

    return true;
  });
}

export function findOffering(id: string): OfferingDetail | undefined {
  return mockOfferings.find((offering) => offering.id === id || offering.slug === id);
}

export function buildScheduleFeed(offeringIds?: string[]) {
  const base = offeringIds?.length
    ? mockOfferings.filter((offering) => offeringIds.includes(offering.id))
    : mockOfferings;

  return base
    .flatMap((offering) =>
      offering.scheduleEvents.map((event) => ({
        id: `${offering.id}-${event.id}`,
        offeringId: offering.id,
        complexName: offering.complexName,
        stage: offering.currentStage,
        eventType: event.eventType,
        label: event.displayLabel,
        date: event.startsAt,
        status: event.status,
      })),
    )
    .sort((left, right) => left.date.localeCompare(right.date));
}

function calculateHomelessScore(years: number): number {
  if (years >= 15) {
    return 32;
  }

  if (years <= 0) {
    return 0;
  }

  return Math.min(32, Math.floor(years / 2) * 4 + 4);
}

function calculateDependentScore(count: number): number {
  const scoreTable = [5, 10, 15, 20, 25, 30, 35];
  return scoreTable[Math.max(0, Math.min(6, count))] ?? 0;
}

function calculateSubscriptionScore(years: number): number {
  if (years >= 15) {
    return 17;
  }

  if (years <= 0) {
    return 0;
  }

  return Math.min(17, Math.floor(years) + 2);
}

export function calculateScore(input: ScoreInput): ScoreResult {
  const homelessScore = calculateHomelessScore(input.homelessPeriodYears);
  const dependentScore = calculateDependentScore(input.dependentCount);
  const subscriptionScore = calculateSubscriptionScore(input.subscriptionPeriodYears);
  const totalScore = homelessScore + dependentScore + subscriptionScore;

  let assessmentLabel = "추첨제 비율이 높은 단지도 함께 보는 것이 유리합니다.";
  if (totalScore >= 65) {
    assessmentLabel = "수도권 인기 단지도 비교 검토해볼 만한 점수대입니다.";
  } else if (totalScore >= 55) {
    assessmentLabel = "경쟁률이 너무 높지 않은 단지 중심으로 전략을 세우는 편이 좋습니다.";
  }

  return {
    homelessScore,
    dependentScore,
    subscriptionScore,
    totalScore,
    assessmentLabel,
  };
}

const specialSupplyLabels: Record<SpecialSupplyType, string> = {
  newlywed: "신혼부부 특별공급",
  first_time_buyer: "생애최초 특별공급",
  multi_child: "다자녀 특별공급",
  elder_support: "노부모부양 특별공급",
  institution_recommendation: "기관추천 특별공급",
};

export function checkEligibility(profile: UserProfile, offering?: OfferingDetail): EligibilityResult {
  const targetOfferings = offering ? [offering] : mockOfferings;
  const eligibleSupplyTypes = new Set<string>();
  const cautions = new Set<string>();
  const requiresReview = new Set<string>();

  for (const item of targetOfferings) {
    for (const rule of item.supplyRules) {
      if (rule.homelessRequired && !profile.isHomeless) {
        cautions.add("무주택 요건을 충족하지 않으면 대부분의 공급 유형 지원이 어렵습니다.");
        continue;
      }

      if (rule.subscriptionAccountRequired && !profile.hasSubscriptionAccount) {
        requiresReview.add("청약통장 보유 여부와 가입 기간을 먼저 확인해야 합니다.");
        continue;
      }

      if (
        rule.subscriptionAccountRequired &&
        profile.subscriptionPeriodMonths < rule.subscriptionMinPeriodMonths
      ) {
        requiresReview.add("청약통장 가입 기간이 공급 기준을 충족하는지 추가 확인이 필요합니다.");
        continue;
      }

      if (rule.headOfHouseholdRequired && !profile.isHeadOfHousehold) {
        cautions.add("세대주 요건이 필요한 특별공급이 포함되어 있습니다.");
        continue;
      }

      if (rule.specialSupplyType) {
        if (profile.specialSupplyFlags.includes(rule.specialSupplyType)) {
          eligibleSupplyTypes.add(specialSupplyLabels[rule.specialSupplyType]);
        } else {
          requiresReview.add("특별공급 대상 여부와 소득·자산 기준을 함께 점검해야 합니다.");
        }
      } else {
        eligibleSupplyTypes.add("일반공급");
      }
    }
  }

  if (profile.residenceRegion1 === "서울") {
    eligibleSupplyTypes.add("서울 우선공급 검토");
  }

  if (profile.budgetMax && profile.budgetMax < 600000000) {
    cautions.add("예산 기준으로는 공공분양과 중소형 타입 위주 검토가 현실적입니다.");
  }

  return {
    eligibleSupplyTypes: [...eligibleSupplyTypes],
    cautions: [...cautions],
    requiresReview: [...requiresReview],
  };
}
