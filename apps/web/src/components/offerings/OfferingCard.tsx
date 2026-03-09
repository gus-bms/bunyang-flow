import type { OfferingDetail } from "@bunyang-flow/shared";
import { Link } from "react-router-dom";

import { formatDate, formatPrice } from "../../lib/format";
import { usePreferenceStore } from "../../store/preferences";
import { StageBadge } from "./StageBadge";

export function OfferingCard({ offering }: { offering: OfferingDetail }) {
  const savedOfferingIds = usePreferenceStore((state) => state.savedOfferingIds);
  const toggleSavedOffering = usePreferenceStore((state) => state.toggleSavedOffering);
  const comparisonIds = usePreferenceStore((state) => state.comparisonIds);
  const toggleComparison = usePreferenceStore((state) => state.toggleComparison);
  const isSaved = savedOfferingIds.includes(offering.id);
  const isComparing = comparisonIds.includes(offering.id);

  return (
    <article className="offering-card">
      <div className="offering-card__topline">
        <StageBadge stage={offering.currentStage} />
        <div className="offering-card__actions">
          <button
            type="button"
            className={isComparing ? "icon-button is-active" : "icon-button"}
            onClick={() => toggleComparison(offering.id)}
            title={isComparing ? "비교함에서 제거" : "비교함에 추가"}
          >
            {isComparing ? "비교 ✓" : "비교"}
          </button>
          <button
            type="button"
            className={isSaved ? "icon-button is-active" : "icon-button"}
            onClick={() => toggleSavedOffering(offering.id)}
          >
            {isSaved ? "관심 저장됨" : "관심 저장"}
          </button>
        </div>
      </div>
      <div className="offering-card__header">
        <div>
          <h3>{offering.complexName}</h3>
          <p className="muted">{offering.regionLabel}</p>
        </div>
        <p className="price-chip">
          {formatPrice(offering.minSalePrice)} - {formatPrice(offering.maxSalePrice)}
        </p>
      </div>
      <p className="offering-card__summary">{offering.summaryText}</p>
      <div className="offering-card__facts">
        <span>{offering.supplySummary}</span>
        <span>{offering.areaRangeLabel}</span>
      </div>
      <div className="offering-card__schedule">
        <strong>{offering.nextScheduleLabel}</strong>
        <span>{formatDate(offering.nextScheduleAt)}</span>
      </div>
      <Link
        className="primary-link"
        to={`/offerings/${offering.id}`}
      >
        상세 보기
      </Link>
    </article>
  );
}
