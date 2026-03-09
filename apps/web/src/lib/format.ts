import {
  getStageLabel,
  type OfferingStage,
  type RegulationInfo,
} from "@bunyang-flow/shared";

export function formatPrice(value: number): string {
  if (value <= 0) {
    return "미정";
  }

  const eok = value / 100000000;
  return `${eok.toFixed(eok >= 10 ? 0 : 1)}억`;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(new Date(value));
}

export function getStageTone(stage: OfferingStage): string {
  switch (stage) {
    case "special_supply_open":
      return "rose";
    case "priority_1_open":
    case "priority_2_open":
      return "amber";
    case "announcement_open":
      return "sky";
    case "winner_announced":
      return "emerald";
    case "contract_open":
      return "slate";
    default:
      return "sand";
  }
}

export function getStageDisplay(stage: OfferingStage): string {
  return getStageLabel(stage);
}

export function buildRegulationBadges(info: RegulationInfo): string[] {
  return [
    info.priceCapApplied ? "분양가 상한제" : "상한제 미적용",
    `전매제한 ${info.resaleRestrictionMonths / 12}년`,
    info.residencyObligationMonths
      ? `실거주 ${info.residencyObligationMonths / 12}년`
      : "실거주 의무 없음",
    info.interimLoanAvailable ? "중도금 대출 가능" : "중도금 대출 확인 필요",
  ];
}
