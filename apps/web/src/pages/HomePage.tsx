import { useQuery } from "@tanstack/react-query";
import { getActionableStages } from "@bunyang-flow/shared";
import { Link } from "react-router-dom";

import { OfferingCard } from "../components/offerings/OfferingCard";
import { getOfferings } from "../lib/api";
import { usePreferenceStore } from "../store/preferences";

// 빠른 메뉴 타일
const QUICK_ACTIONS = [
  { label: "자격 진단", to: "/eligibility", bg: "#007aff", icon: "✓" },
  { label: "가점 계산", to: "/score",       bg: "#34c759", icon: "#" },
  { label: "일정 보기", to: "/schedule",    bg: "#ff9500", icon: "◷" },
  { label: "지도 보기", to: "/offerings/map", bg: "#5856d6", icon: "◎" },
];

export function HomePage() {
  const profile = usePreferenceStore((state) => state.profile);
  const { data } = useQuery({
    queryKey: ["offerings", "home"],
    queryFn: () => getOfferings(),
  });

  const items = data?.items ?? [];
  const actionable = items.filter((item) => getActionableStages().includes(item.currentStage));
  const specialSupply = items.filter((item) => item.currentStage === "special_supply_open");
  const imminent = items.filter(
    (item) => item.currentStage === "winner_announced" || item.currentStage === "contract_open",
  );
  const upcoming = items.filter(
    (item) => item.currentStage === "planned" || item.currentStage === "announcement_open",
  );
  const recommended = items.filter(
    (item) =>
      profile.residenceRegion1 &&
      item.regionLabel.includes(profile.residenceRegion1) &&
      (!profile.budgetMax || item.minSalePrice <= profile.budgetMax),
  );

  const today = new Date();
  const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일`;

  return (
    <div className="page-stack">

      {/* ── 홈 히어로 ── */}
      <div className="home-hero">
        <p className="home-hero__greeting">{dateLabel} 기준</p>
        <h2 className="home-hero__title">분양 현황</h2>
        <div className="home-stats">
          <div className="home-stat">
            <div className="home-stat__num">{actionable.length}</div>
            <div className="home-stat__label">청약 중</div>
          </div>
          <div className="home-stat">
            <div className="home-stat__num">{upcoming.length}</div>
            <div className="home-stat__label">분양 예정</div>
          </div>
          <div className="home-stat">
            <div className="home-stat__num">{imminent.length}</div>
            <div className="home-stat__label">마감 임박</div>
          </div>
        </div>
      </div>

      {/* ── 빠른 메뉴 ── */}
      <div className="quick-actions">
        {QUICK_ACTIONS.map((a) => (
          <Link key={a.to} to={a.to} className="quick-action-tile">
            <div
              className="quick-action-tile__icon"
              style={{ background: a.bg, color: "#fff" }}
            >
              {a.icon}
            </div>
            <span className="quick-action-tile__label">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* ── 지금 청약 가능 ── */}
      <section className="section-block" style={{ marginTop: 8 }}>
        <div className="section-block__header">
          <h3>지금 청약 중</h3>
          <Link to="/offerings" style={{ fontSize: 15, color: "var(--c-blue)" }}>
            전체 보기
          </Link>
        </div>
        {actionable.length === 0 ? (
          <p style={{ padding: "8px 16px 16px", color: "var(--c-label3)", fontSize: 14 }}>
            현재 청약 중인 단지가 없습니다
          </p>
        ) : (
          <div className="card-scroll">
            {actionable.map((offering) => (
              <OfferingCard key={offering.id} offering={offering} />
            ))}
          </div>
        )}
      </section>

      {/* ── 특별공급 진행 중 ── */}
      {specialSupply.length > 0 && (
        <section className="section-block">
          <div className="section-block__header">
            <h3>특별공급 중</h3>
            <span style={{ fontSize: 13, color: "var(--c-label3)" }}>
              {specialSupply.length}건
            </span>
          </div>
          <div className="card-scroll">
            {specialSupply.map((offering) => (
              <OfferingCard key={offering.id} offering={offering} />
            ))}
          </div>
        </section>
      )}

      {/* ── 마감 임박 ── */}
      {imminent.length > 0 && (
        <section className="section-block">
          <div className="section-block__header">
            <h3>마감 임박</h3>
            <span style={{ fontSize: 13, color: "var(--c-red)" }}>발표·계약</span>
          </div>
          <div className="card-scroll">
            {imminent.map((offering) => (
              <OfferingCard key={offering.id} offering={offering} />
            ))}
          </div>
        </section>
      )}

      {/* ── 분양 예정 ── */}
      <section className="section-block">
        <div className="section-block__header">
          <h3>분양 예정</h3>
          <Link to="/offerings?preset=upcoming" style={{ fontSize: 15, color: "var(--c-blue)" }}>
            더보기
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p style={{ padding: "8px 16px 16px", color: "var(--c-label3)", fontSize: 14 }}>
            예정 단지가 없습니다
          </p>
        ) : (
          <div className="card-scroll">
            {upcoming.map((offering) => (
              <OfferingCard key={offering.id} offering={offering} />
            ))}
          </div>
        )}
      </section>

      {/* ── 내 조건 추천 ── */}
      {recommended.length > 0 && (
        <section className="section-block" style={{ marginBottom: 8 }}>
          <div className="section-block__header">
            <h3>내 조건 추천</h3>
            <span style={{ fontSize: 13, color: "var(--c-label3)" }}>
              {profile.residenceRegion1} · 예산 기준
            </span>
          </div>
          <div className="card-scroll">
            {recommended.map((offering) => (
              <OfferingCard key={offering.id} offering={offering} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
