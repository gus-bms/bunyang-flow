import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { PageHeader } from "../components/common/PageHeader";
import { RegulationBadgeList } from "../components/offerings/RegulationBadgeList";
import { StageBadge } from "../components/offerings/StageBadge";
import { checkEligibility, getMyScore, getOffering } from "../lib/api";
import { formatDate, formatPrice } from "../lib/format";
import { usePreferenceStore } from "../store/preferences";

export function OfferingDetailPage() {
  const params = useParams();
  const profile = usePreferenceStore((state) => state.profile);
  const offeringId = params.id ?? "";

  const { data: offering } = useQuery({
    queryKey: ["offering", offeringId],
    queryFn: () => getOffering(offeringId),
    enabled: Boolean(offeringId),
  });

  const { data: eligibility } = useQuery({
    queryKey: ["eligibility", offeringId, profile],
    queryFn: () =>
      checkEligibility({
        ...profile,
        offeringId,
      }),
    enabled: Boolean(offeringId),
  });

  const { data: myScore } = useQuery({
    queryKey: ["score", "me"],
    queryFn: getMyScore,
  });

  if (!offering) {
    return <div className="panel">단지 정보를 불러오는 중입니다.</div>;
  }

  return (
    <div className="page-stack">
      <PageHeader
        title={offering.complexName}
        description={offering.regionLabel}
      />

      <section className="panel detail-hero">
        <div className="detail-hero__headline">
          <StageBadge stage={offering.currentStage} />
          <p className="muted">{offering.summaryText}</p>
        </div>
        <div className="detail-grid">
          <div className="metric-card">
            <span>다음 일정</span>
            <strong>{offering.nextScheduleLabel}</strong>
            <p>{formatDate(offering.nextScheduleAt)}</p>
          </div>
          <div className="metric-card">
            <span>대표 분양가</span>
            <strong>
              {formatPrice(offering.minSalePrice)} - {formatPrice(offering.maxSalePrice)}
            </strong>
            <p>{offering.areaRangeLabel}</p>
          </div>
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">내 조건 기준</p>
        <h3>지원 가능성 요약</h3>
        <p>{eligibility?.eligibleSupplyTypes.join(", ") || "진단 결과 확인 중"}</p>
        <div className="list-row">
          {(eligibility?.requiresReview ?? []).map((item) => (
            <span
              key={item}
              className="soft-badge"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">규제 정보</p>
        <RegulationBadgeList regulation={offering.regulationInfo} />
      </section>

      <section className="panel">
        <p className="eyebrow">경쟁률 참고</p>
        <div className="detail-grid">
          {offering.competitionRates.map((rate) => (
            <div
              key={rate.id}
              className="metric-card"
            >
              <span>{rate.typeName}</span>
              <strong>{rate.competitionRatio.toFixed(1)} : 1</strong>
              <p>
                컷 {rate.minWinningScore ?? "-"} - {rate.maxWinningScore ?? "-"} / 내 가점{" "}
                {myScore?.totalScore ?? "-"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">타입별 분양가</p>
        <div className="detail-grid">
          {offering.housingTypes.map((item) => (
            <div
              key={item.id}
              className="metric-card"
            >
              <span>{item.typeName}</span>
              <strong>
                {formatPrice(item.salePriceMin)} - {formatPrice(item.salePriceMax)}
              </strong>
              <p>
                계약금 {item.contractDepositRate}% / 중도금 {item.middlePaymentRate}% / 잔금{" "}
                {item.balanceRate}%
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">일정 타임라인</p>
        <div className="timeline">
          {offering.scheduleEvents.map((event) => (
            <div
              key={event.id}
              className="timeline__item"
            >
              <strong>{event.displayLabel}</strong>
              <span>{formatDate(event.startsAt)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
