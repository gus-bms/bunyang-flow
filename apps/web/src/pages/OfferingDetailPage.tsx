import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { FundingSimulator } from "../components/offerings/FundingSimulator";
import { RegulationBadgeList } from "../components/offerings/RegulationBadgeList";
import { StageBadge } from "../components/offerings/StageBadge";
import { checkEligibility, getCompetition, getMyScore, getOffering } from "../lib/api";
import { formatDate, formatPrice } from "../lib/format";
import { usePreferenceStore } from "../store/preferences";

export function OfferingDetailPage() {
  const params = useParams();
  const [showFunding, setShowFunding] = useState(false);
  const profile = usePreferenceStore((s) => s.profile);
  const savedOfferingIds = usePreferenceStore((s) => s.savedOfferingIds);
  const toggleSavedOffering = usePreferenceStore((s) => s.toggleSavedOffering);
  const comparisonIds = usePreferenceStore((s) => s.comparisonIds);
  const toggleComparison = usePreferenceStore((s) => s.toggleComparison);
  const offeringId = params.id ?? "";

  const { data: offering } = useQuery({
    queryKey: ["offering", offeringId],
    queryFn: () => getOffering(offeringId),
    enabled: Boolean(offeringId),
  });

  const { data: eligibility } = useQuery({
    queryKey: ["eligibility", offeringId, profile],
    queryFn: () => checkEligibility({ ...profile, offeringId }),
    enabled: Boolean(offeringId),
  });

  const { data: myScore } = useQuery({
    queryKey: ["score", "me"],
    queryFn: getMyScore,
  });

  const liveStages = new Set(["special_supply_open", "priority_1_open", "priority_2_open"]);
  const isLiveStage = offering ? liveStages.has(offering.currentStage) : false;

  const { data: competition } = useQuery({
    queryKey: ["competition", offeringId],
    queryFn: () => getCompetition(offeringId),
    enabled: Boolean(offeringId),
    refetchInterval: isLiveStage ? 10 * 60 * 1000 : false,
  });

  if (!offering) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "var(--c-label3)" }}>
        단지 정보를 불러오는 중...
      </div>
    );
  }

  const isSaved = savedOfferingIds.includes(offering.id);
  const isComparing = comparisonIds.includes(offering.id);

  return (
    <div className="page-stack">
      <Helmet>
        <title>{offering.complexName} — 분양플로우</title>
        <meta name="description" content={`${offering.regionLabel} ${offering.complexName} · ${offering.summaryText}`} />
        <meta property="og:title" content={`${offering.complexName} — 분양플로우`} />
        <meta property="og:description" content={`${offering.regionLabel} · ${offering.nextScheduleLabel} ${offering.nextScheduleAt}`} />
        <meta property="og:type" content="article" />
      </Helmet>

      {/* ── 히어로 ── */}
      <div style={{ padding: "16px 16px 0" }}>
        <StageBadge stage={offering.currentStage} />
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: "8px 0 2px", letterSpacing: "-0.5px" }}>
          {offering.complexName}
        </h2>
        <p style={{ fontSize: 15, color: "var(--c-label3)", margin: "0 0 12px" }}>
          {offering.regionLabel}
        </p>

        {/* 액션 버튼 */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className={isSaved ? "primary-link" : "outline-button"}
            onClick={() => toggleSavedOffering(offering.id)}
            style={{ flex: 1 }}
          >
            {isSaved ? "♥ 저장됨" : "♡ 관심 저장"}
          </button>
          <button
            type="button"
            className={isComparing ? "primary-link" : "outline-button"}
            onClick={() => toggleComparison(offering.id)}
            style={{ flex: 1 }}
          >
            {isComparing ? "비교 중" : "비교함 추가"}
          </button>
        </div>
      </div>

      {/* ── 핵심 지표 ── */}
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="metric-card">
            <div className="metric-card__label">다음 일정</div>
            <div className="metric-card__value" style={{ color: "var(--c-blue)" }}>{offering.nextScheduleLabel || "—"}</div>
            <span style={{ fontSize: 13, color: "var(--c-label3)" }}>{formatDate(offering.nextScheduleAt)}</span>
          </div>
          <div className="metric-card">
            <div className="metric-card__label">대표 분양가</div>
            <div className="metric-card__value" style={{ color: "var(--c-blue)" }}>
              {offering.minSalePrice > 0 ? formatPrice(offering.minSalePrice) : "미정"}
            </div>
            <span style={{ fontSize: 13, color: "var(--c-label3)" }}>{offering.areaRangeLabel}</span>
          </div>
        </div>
      </div>

      {/* ── 지원 가능성 ── */}
      <SectionLabel>내 조건 기준</SectionLabel>
      <div className="inset-group">
        <div className="inset-group__row">
          <span className="inset-group__label">지원 가능 유형</span>
          <span className="inset-group__value">
            {eligibility?.eligibleSupplyTypes.join(", ") || "확인 중"}
          </span>
        </div>
        {(eligibility?.requiresReview ?? []).map((item) => (
          <div key={item} className="inset-group__row">
            <span className="inset-group__label" style={{ color: "var(--c-orange)" }}>{item}</span>
          </div>
        ))}
      </div>

      {/* ── 규제 정보 ── */}
      <SectionLabel>규제 정보</SectionLabel>
      <div style={{ padding: "0 16px" }}>
        <RegulationBadgeList regulation={offering.regulationInfo} />
      </div>

      {/* ── 입지 요약 ── */}
      {offering.locationHighlights.length > 0 && (
        <>
          <SectionLabel>입지 요약</SectionLabel>
          <div className="inset-group">
            {offering.locationHighlights.map((item) => (
              <div key={item} className="inset-group__row">
                <span className="inset-group__label">{item}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── 경쟁률 ── */}
      <SectionLabel>
        경쟁률
        {competition?.isLive && (
          <span style={{ marginLeft: 8, fontSize: 11, color: "var(--c-green)", fontWeight: 600, textTransform: "none", letterSpacing: 0 }}>
            LIVE
          </span>
        )}
      </SectionLabel>
      {competition?.isLive && competition.lastUpdatedAt && (
        <p style={{ fontSize: 12, color: "var(--c-label3)", padding: "0 16px 4px", margin: 0 }}>
          {new Date(competition.lastUpdatedAt).toLocaleString("ko-KR")} 기준
        </p>
      )}
      <div className="detail-grid">
        {(competition?.rates ?? offering.competitionRates).map((rate) => (
          <div key={rate.id} className="metric-card">
            <div className="metric-card__label">{rate.typeName}</div>
            <div className="metric-card__value">{rate.competitionRatio.toFixed(1)} : 1</div>
            <span style={{ fontSize: 12, color: "var(--c-label3)" }}>
              컷 {rate.minWinningScore ?? "—"}~{rate.maxWinningScore ?? "—"} / 내 {myScore?.totalScore ?? "—"}점
            </span>
          </div>
        ))}
      </div>

      {/* ── 타입별 분양가 ── */}
      <SectionLabel>타입별 분양가</SectionLabel>
      <div className="detail-grid">
        {offering.housingTypes.map((t) => (
          <div key={t.id} className="metric-card">
            <div className="metric-card__label">{t.typeName}</div>
            <div className="metric-card__value">{formatPrice(t.salePriceMin)} ~ {formatPrice(t.salePriceMax)}</div>
            <span style={{ fontSize: 12, color: "var(--c-label3)" }}>
              계약금 {t.contractDepositRate}% · 중도금 {t.middlePaymentRate}% · 잔금 {t.balanceRate}%
            </span>
          </div>
        ))}
      </div>

      {/* ── 일정 타임라인 ── */}
      <SectionLabel>일정</SectionLabel>
      <div className="inset-group">
        {offering.scheduleEvents.map((ev) => (
          <div
            key={ev.id}
            className="inset-group__row"
            style={ev.status === "ongoing" ? { background: "rgba(0,122,255,0.06)" } : ev.status === "completed" ? { opacity: 0.5 } : {}}
          >
            <span className="inset-group__label" style={ev.status === "completed" ? { textDecoration: "line-through" } : {}}>
              {ev.displayLabel}
            </span>
            <span className="inset-group__value">
              {formatDate(ev.startsAt)}
              {ev.endsAt && ev.endsAt !== ev.startsAt && ` ~ ${formatDate(ev.endsAt)}`}
            </span>
          </div>
        ))}
      </div>

      {/* ── 자금 시뮬레이션 ── */}
      {offering.housingTypes.length > 0 && (
        <>
          <SectionLabel>자금 계획</SectionLabel>
          <div style={{ padding: "0 16px" }}>
            <button
              type="button"
              className="secondary-link"
              onClick={() => setShowFunding((v) => !v)}
              style={{ width: "100%" }}
            >
              {showFunding ? "시뮬레이션 닫기" : "자금 시뮬레이션 열기"}
            </button>
            {showFunding && (
              <div style={{ marginTop: 12 }}>
                <FundingSimulator
                  housingTypes={offering.housingTypes}
                  contractDate={offering.scheduleEvents.find((e) => e.eventType === "contract")?.startsAt}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* ── 유의사항 ── */}
      {offering.noticeHighlights.length > 0 && (
        <>
          <SectionLabel>유의사항</SectionLabel>
          <div className="inset-group">
            {offering.noticeHighlights.map((item) => (
              <div key={item} className="inset-group__row">
                <span className="inset-group__label" style={{ color: "var(--c-red)" }}>{item}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}

/** iOS 섹션 레이블 */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 13,
      fontWeight: 600,
      color: "var(--c-label3)",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      padding: "20px 16px 6px",
    }}>
      {children}
    </div>
  );
}
