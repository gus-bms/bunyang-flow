import type { OfferingDetail } from "@bunyang-flow/shared";
import { Link } from "react-router-dom";

import { formatDate, formatPrice } from "../../lib/format";
import { usePreferenceStore } from "../../store/preferences";
import { StageBadge } from "./StageBadge";

export function OfferingCard({ offering }: { offering: OfferingDetail }) {
  const savedOfferingIds = usePreferenceStore((state) => state.savedOfferingIds);
  const toggleSavedOffering = usePreferenceStore((state) => state.toggleSavedOffering);
  const isSaved = savedOfferingIds.includes(offering.id);

  const hasPrice = offering.minSalePrice > 0;

  return (
    <article className="offering-card">
      {/* 카드 전체 = 링크 */}
      <Link to={`/offerings/${offering.id}`} className="offering-card__link">
        {/* 상단: 단계 배지 */}
        <div className="offering-card__topline">
          <StageBadge stage={offering.currentStage} />
        </div>

        {/* 단지명 + 지역 */}
        <h3 className="offering-card__name">{offering.complexName}</h3>
        <p className="offering-card__region">{offering.regionLabel}</p>

        {/* 분양가 */}
        {hasPrice && (
          <p className="offering-card__price">
            {formatPrice(offering.minSalePrice)}
            {offering.maxSalePrice > offering.minSalePrice &&
              ` ~ ${formatPrice(offering.maxSalePrice)}`}
          </p>
        )}
        {!hasPrice && (
          <p className="offering-card__price" style={{ color: "var(--c-label3)", fontSize: 15 }}>
            가격 미정
          </p>
        )}
      </Link>

      {/* 하단 푸터: 다음 일정 + 저장 버튼 */}
      <div className="offering-card__footer">
        <div>
          <div className="offering-card__deadline-label">
            {offering.nextScheduleLabel || "일정 확인"}
          </div>
          <div className="offering-card__deadline-date">
            {offering.nextScheduleAt ? formatDate(offering.nextScheduleAt) : "—"}
          </div>
        </div>

        <button
          type="button"
          className={`card-icon-btn${isSaved ? " is-active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSavedOffering(offering.id);
          }}
          title={isSaved ? "관심 해제" : "관심 저장"}
          aria-label={isSaved ? "관심 해제" : "관심 저장"}
        >
          {isSaved ? "♥" : "♡"}
        </button>
      </div>
    </article>
  );
}
