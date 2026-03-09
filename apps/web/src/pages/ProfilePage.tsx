import { Link } from "react-router-dom";

import { PageHeader } from "../components/common/PageHeader";
import { formatPrice } from "../lib/format";
import { usePreferenceStore } from "../store/preferences";

const specialSupplyLabels: Record<string, string> = {
  newlywed: "신혼부부",
  first_time_buyer: "생애최초",
  multi_child: "다자녀",
  elder_support: "노부모부양",
  institution_recommendation: "기관추천",
};

export function ProfilePage() {
  const profile = usePreferenceStore((state) => state.profile);
  const savedOfferingIds = usePreferenceStore((state) => state.savedOfferingIds);
  const comparisonIds = usePreferenceStore((state) => state.comparisonIds);
  const alertedOfferingIds = usePreferenceStore((state) => state.alertedOfferingIds);

  const specialSupplyText = profile.specialSupplyFlags.length
    ? profile.specialSupplyFlags.map((flag) => specialSupplyLabels[flag] ?? flag).join(", ")
    : "없음";

  return (
    <div className="page-stack">
      <PageHeader
        title="마이페이지"
        description="비로그인 MVP 기준으로 로컬에 저장된 조건과 관심 단지를 관리합니다."
        action={
          <Link
            className="secondary-link"
            to="/onboarding"
          >
            조건 재설정
          </Link>
        }
      />

      <section className="panel">
        <p className="eyebrow">내 청약 조건</p>
        <div className="profile-grid">
          <div className="profile-item">
            <span className="profile-item__label">거주 지역</span>
            <span className="profile-item__value">{profile.residenceRegion1}</span>
          </div>
          <div className="profile-item">
            <span className="profile-item__label">주택 상태</span>
            <span className="profile-item__value">{profile.isHomeless ? "무주택" : "유주택"}</span>
          </div>
          <div className="profile-item">
            <span className="profile-item__label">세대주</span>
            <span className="profile-item__value">{profile.isHeadOfHousehold ? "세대주" : "세대원"}</span>
          </div>
          <div className="profile-item">
            <span className="profile-item__label">예산 상한</span>
            <span className="profile-item__value">
              {profile.budgetMax ? formatPrice(profile.budgetMax) : "미설정"}
            </span>
          </div>
          <div className="profile-item">
            <span className="profile-item__label">청약통장</span>
            <span className="profile-item__value">
              {profile.hasSubscriptionAccount
                ? `${profile.subscriptionPeriodMonths}개월`
                : "미보유"}
            </span>
          </div>
          <div className="profile-item">
            <span className="profile-item__label">특별공급</span>
            <span className="profile-item__value">{specialSupplyText}</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">저장 상태</p>
        <div className="profile-grid">
          <div className="profile-item">
            <span className="profile-item__label">관심 단지</span>
            <Link
              to="/saved"
              className="profile-item__value"
            >
              {savedOfferingIds.length}건 →
            </Link>
          </div>
          <div className="profile-item">
            <span className="profile-item__label">비교함</span>
            <Link
              to="/compare"
              className="profile-item__value"
            >
              {comparisonIds.length}건 →
            </Link>
          </div>
          <div className="profile-item">
            <span className="profile-item__label">알림 설정</span>
            <Link
              to="/alerts"
              className="profile-item__value"
            >
              {alertedOfferingIds.length}건 →
            </Link>
          </div>
        </div>
        <p className="muted">로그인 전에도 조건과 저장 목록을 이어볼 수 있게 설계했습니다.</p>
      </section>

      <section className="panel">
        <p className="eyebrow">빠른 도구</p>
        <div className="hero-panel__actions">
          <Link
            to="/eligibility"
            className="secondary-link"
          >
            자격 진단
          </Link>
          <Link
            to="/score"
            className="secondary-link"
          >
            가점 계산
          </Link>
          <Link
            to="/schedule"
            className="secondary-link"
          >
            일정 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
