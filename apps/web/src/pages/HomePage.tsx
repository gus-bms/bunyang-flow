import { useQuery } from "@tanstack/react-query";
import { getActionableStages } from "@bunyang-flow/shared";
import { Link } from "react-router-dom";

import { PageHeader } from "../components/common/PageHeader";
import { OfferingCard } from "../components/offerings/OfferingCard";
import { getOfferings } from "../lib/api";
import { formatPrice } from "../lib/format";
import { usePreferenceStore } from "../store/preferences";

export function HomePage() {
  const profile = usePreferenceStore((state) => state.profile);
  const { data } = useQuery({
    queryKey: ["offerings", "home"],
    queryFn: () => getOfferings(),
  });

  const items = data?.items ?? [];
  const actionable = items.filter((item) => getActionableStages().includes(item.currentStage));
  const upcoming = items.filter((item) => item.currentStage === "planned" || item.currentStage === "announcement_open");
  const recommended = items.filter(
    (item) =>
      item.regionLabel.includes(profile.residenceRegion1) &&
      (!profile.budgetMax || item.minSalePrice <= profile.budgetMax),
  );

  return (
    <div className="page-stack">
      <PageHeader
        title="지금 행동 가능한 분양부터 정리합니다"
        description="단지 소개보다 단계, 일정, 자격, 가격 순서로 바로 판단할 수 있게 구성했습니다."
        action={
          <Link
            className="secondary-link"
            to="/offerings"
          >
            전체 보기
          </Link>
        }
      />

      <section className="panel hero-panel">
        <div>
          <p className="eyebrow">내 조건 요약</p>
          <h3>
            {profile.residenceRegion1} / {profile.isHomeless ? "무주택" : "유주택"} / 예산{" "}
            {profile.budgetMax ? formatPrice(profile.budgetMax) : "미설정"} 이하
          </h3>
          <p className="muted">
            특별공급: {profile.specialSupplyFlags.length ? profile.specialSupplyFlags.join(", ") : "없음"}
          </p>
        </div>
        <div className="hero-panel__actions">
          <Link
            className="primary-link"
            to="/eligibility"
          >
            자격 진단
          </Link>
          <Link
            className="secondary-link"
            to="/score"
          >
            가점 계산
          </Link>
        </div>
      </section>

      <section className="section-block">
        <div className="section-block__header">
          <h3>지금 청약 가능한 단지</h3>
          <span>{actionable.length}건</span>
        </div>
        <div className="card-grid">
          {actionable.map((offering) => (
            <OfferingCard
              key={offering.id}
              offering={offering}
            />
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-block__header">
          <h3>곧 공고가 나오는 단지</h3>
          <Link
            className="secondary-link"
            to="/offerings?preset=upcoming"
          >
            더보기
          </Link>
        </div>
        <div className="card-grid">
          {upcoming.map((offering) => (
            <OfferingCard
              key={offering.id}
              offering={offering}
            />
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-block__header">
          <h3>내 조건에 맞는 추천 단지</h3>
          <span>지역·예산 기준</span>
        </div>
        <div className="card-grid">
          {recommended.map((offering) => (
            <OfferingCard
              key={offering.id}
              offering={offering}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
