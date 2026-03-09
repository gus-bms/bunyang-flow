import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { PageHeader } from "../components/common/PageHeader";
import { RegulationBadgeList } from "../components/offerings/RegulationBadgeList";
import { StageBadge } from "../components/offerings/StageBadge";
import { getOfferings } from "../lib/api";
import { formatDate, formatPrice } from "../lib/format";
import { usePreferenceStore } from "../store/preferences";

export function ComparisonPage() {
  const comparisonIds = usePreferenceStore((state) => state.comparisonIds);
  const toggleComparison = usePreferenceStore((state) => state.toggleComparison);

  const { data } = useQuery({
    queryKey: ["offerings", "comparison"],
    queryFn: () => getOfferings(),
    enabled: comparisonIds.length > 0,
  });

  const items = (data?.items ?? []).filter((offering) => comparisonIds.includes(offering.id));

  if (comparisonIds.length === 0) {
    return (
      <div className="page-stack">
        <PageHeader
          title="비교함"
          description="최대 5개 단지를 나란히 비교합니다."
        />
        <div className="panel">
          <p>비교함이 비어 있습니다.</p>
          <Link
            to="/offerings"
            className="secondary-link"
          >
            분양 찾기에서 단지 추가하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="비교함"
        description={`${items.length}개 단지 비교 중`}
        action={
          <Link
            to="/offerings"
            className="secondary-link"
          >
            단지 추가
          </Link>
        }
      />

      <div className="comparison-grid">
        {items.map((offering) => (
          <div
            key={offering.id}
            className="comparison-col"
          >
            <div className="comparison-col__header">
              <Link
                to={`/offerings/${offering.slug}`}
                className="comparison-col__name"
              >
                {offering.complexName}
              </Link>
              <button
                type="button"
                className="unsave-button"
                onClick={() => toggleComparison(offering.id)}
              >
                제거
              </button>
            </div>

            <div className="comparison-row">
              <span className="comparison-label">단계</span>
              <StageBadge stage={offering.currentStage} />
            </div>

            <div className="comparison-row">
              <span className="comparison-label">지역</span>
              <span>{offering.regionLabel}</span>
            </div>

            <div className="comparison-row">
              <span className="comparison-label">분양가</span>
              <span>
                {formatPrice(offering.minSalePrice)} ~ {formatPrice(offering.maxSalePrice)}
              </span>
            </div>

            <div className="comparison-row">
              <span className="comparison-label">전용면적</span>
              <span>{offering.areaRangeLabel}</span>
            </div>

            <div className="comparison-row">
              <span className="comparison-label">총 세대수</span>
              <span>{offering.totalHouseholds}세대</span>
            </div>

            <div className="comparison-row">
              <span className="comparison-label">다음 일정</span>
              <span>
                {offering.nextScheduleLabel} ({formatDate(offering.nextScheduleAt)})
              </span>
            </div>

            <div className="comparison-row comparison-row--full">
              <span className="comparison-label">규제</span>
              <RegulationBadgeList regulation={offering.regulationInfo} />
            </div>

            <div className="comparison-row">
              <span className="comparison-label">경쟁률</span>
              <div className="list-stack">
                {offering.competitionRates.map((rate) => (
                  <span key={rate.id}>
                    {rate.typeName}: {rate.competitionRatio.toFixed(1)}:1
                    {rate.avgWinningScore ? ` (평균 ${rate.avgWinningScore}점)` : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
