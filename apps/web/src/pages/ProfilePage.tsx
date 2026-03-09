import { Link } from "react-router-dom";

import { PageHeader } from "../components/common/PageHeader";
import { formatPrice } from "../lib/format";
import { usePreferenceStore } from "../store/preferences";

export function ProfilePage() {
  const profile = usePreferenceStore((state) => state.profile);
  const savedOfferingIds = usePreferenceStore((state) => state.savedOfferingIds);

  return (
    <div className="page-stack">
      <PageHeader
        title="마이페이지"
        description="비로그인 MVP 기준으로 로컬에 저장된 조건과 관심 단지를 관리합니다."
      />

      <section className="panel">
        <p className="eyebrow">내 조건</p>
        <h3>
          {profile.residenceRegion1} / {profile.isHomeless ? "무주택" : "유주택"}
        </h3>
        <p className="muted">
          예산 {profile.budgetMax ? formatPrice(profile.budgetMax) : "미설정"} / 특별공급{" "}
          {profile.specialSupplyFlags.join(", ") || "없음"}
        </p>
        <Link
          className="secondary-link"
          to="/onboarding"
        >
          조건 다시 설정
        </Link>
      </section>

      <section className="panel">
        <p className="eyebrow">저장 상태</p>
        <h3>관심 단지 {savedOfferingIds.length}건</h3>
        <p className="muted">로그인 전에도 조건과 저장 목록을 이어볼 수 있게 설계했습니다.</p>
      </section>
    </div>
  );
}
