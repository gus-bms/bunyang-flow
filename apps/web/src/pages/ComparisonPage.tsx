import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { RegulationBadgeList } from "../components/offerings/RegulationBadgeList";
import { StageBadge } from "../components/offerings/StageBadge";
import { getOfferings } from "../lib/api";
import { formatDate, formatPrice } from "../lib/format";
import { usePreferenceStore } from "../store/preferences";

export function ComparisonPage() {
  const comparisonIds = usePreferenceStore((s) => s.comparisonIds);
  const toggleComparison = usePreferenceStore((s) => s.toggleComparison);

  const { data } = useQuery({
    queryKey: ["offerings", "comparison"],
    queryFn: () => getOfferings(),
    enabled: comparisonIds.length > 0,
  });

  const items = (data?.items ?? []).filter((o) => comparisonIds.includes(o.id));

  return (
    <div className="page-stack">
      <div style={{ padding: "16px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>비교함</h2>
        <Link to="/offerings" style={{ fontSize: 15, color: "var(--c-blue)", fontWeight: 500 }}>추가</Link>
      </div>

      {comparisonIds.length === 0 ? (
        <div style={{ margin: "12px 16px 0", background: "var(--c-surface)", borderRadius: 14, padding: "48px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 15, color: "var(--c-label3)", margin: "0 0 12px" }}>비교함이 비어 있습니다</p>
          <Link to="/offerings" style={{ fontSize: 15, color: "var(--c-blue)", fontWeight: 500 }}>분양 찾기에서 추가</Link>
        </div>
      ) : (
        <div className="comparison-grid" style={{ marginTop: 12 }}>
          {items.map((offering) => (
            <div key={offering.id} className="comparison-col">
              {/* 헤더 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <Link to={`/offerings/${offering.slug}`} style={{ fontSize: 17, fontWeight: 600 }}>
                  {offering.complexName}
                </Link>
                <button
                  type="button"
                  onClick={() => toggleComparison(offering.id)}
                  style={{ background: "none", border: "none", color: "var(--c-red)", fontSize: 13, cursor: "pointer", padding: 0, flexShrink: 0 }}
                >
                  제거
                </button>
              </div>

              <StageBadge stage={offering.currentStage} />

              <CmpRow label="지역" value={offering.regionLabel} />
              <CmpRow label="분양가" value={`${formatPrice(offering.minSalePrice)} ~ ${formatPrice(offering.maxSalePrice)}`} />
              <CmpRow label="면적" value={offering.areaRangeLabel} />
              <CmpRow label="세대수" value={`${offering.totalHouseholds}세대`} />
              <CmpRow label="다음 일정" value={`${offering.nextScheduleLabel} (${formatDate(offering.nextScheduleAt)})`} />

              <div style={{ borderTop: "0.5px solid var(--c-sep)", paddingTop: 10, marginTop: 2 }}>
                <div style={{ fontSize: 11, color: "var(--c-label3)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6 }}>규제</div>
                <RegulationBadgeList regulation={offering.regulationInfo} />
              </div>

              {offering.competitionRates.length > 0 && (
                <div style={{ borderTop: "0.5px solid var(--c-sep)", paddingTop: 10, marginTop: 2 }}>
                  <div style={{ fontSize: 11, color: "var(--c-label3)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6 }}>경쟁률</div>
                  {offering.competitionRates.map((rate) => (
                    <div key={rate.id} style={{ fontSize: 14, marginBottom: 2 }}>
                      {rate.typeName}: <strong>{rate.competitionRatio.toFixed(1)}:1</strong>
                      {rate.avgWinningScore ? ` (평균 ${rate.avgWinningScore}점)` : ""}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ height: 16 }} />
    </div>
  );
}

function CmpRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
      <span style={{ fontSize: 13, color: "var(--c-label3)", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, textAlign: "right" }}>{value}</span>
    </div>
  );
}
