import { Link } from "react-router-dom";
import { useEffect } from "react";

import { formatPrice } from "../lib/format";
import { usePreferenceStore } from "../store/preferences";
import { useAuthStore } from "../store/auth";
import { getMyProfile, logout } from "../lib/api";

const specialSupplyLabels: Record<string, string> = {
  newlywed: "신혼부부",
  first_time_buyer: "생애최초",
  multi_child: "다자녀",
  elder_support: "노부모부양",
  institution_recommendation: "기관추천",
};

export function ProfilePage() {
  const profile = usePreferenceStore((s) => s.profile);
  const updateProfile = usePreferenceStore((s) => s.updateProfile);
  const savedOfferingIds = usePreferenceStore((s) => s.savedOfferingIds);
  const comparisonIds = usePreferenceStore((s) => s.comparisonIds);
  const alertedOfferingIds = usePreferenceStore((s) => s.alertedOfferingIds);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;
    getMyProfile()
      .then((p) => {
        updateProfile({
          residenceRegion1: p.residenceRegion1,
          isHomeless: p.isHomeless,
          isHeadOfHousehold: p.isHeadOfHousehold,
          hasSubscriptionAccount: p.hasSubscriptionAccount,
          subscriptionPeriodMonths: p.subscriptionPeriodMonths,
          specialSupplyFlags: p.specialSupplyFlags as any,
          budgetMax: p.budgetMax ?? undefined,
        });
      })
      .catch(() => {});
  }, [user, updateProfile]);

  const specialText = profile.specialSupplyFlags.length
    ? profile.specialSupplyFlags.map((f) => specialSupplyLabels[f] ?? f).join(", ")
    : "없음";

  return (
    <div className="page-stack">
      {/* 타이틀 */}
      <div style={{ padding: "16px 16px 0" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>마이</h2>
      </div>

      {/* 프로필 카드 */}
      {user && (
        <div style={{ padding: "12px 16px 0" }}>
          <div style={{
            background: "var(--c-surface)",
            borderRadius: 14,
            padding: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}>
            {user.profileImageUrl && (
              <img
                src={user.profileImageUrl}
                alt={user.nickname}
                style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
              />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{user.nickname}</div>
              {user.email && <div style={{ fontSize: 13, color: "var(--c-label3)" }}>{user.email}</div>}
            </div>
          </div>
        </div>
      )}

      {/* 청약 조건 */}
      <SectionLabel>청약 조건</SectionLabel>
      <div className="inset-group">
        <Row label="거주 지역" value={profile.residenceRegion1} />
        <Row label="주택 상태" value={profile.isHomeless ? "무주택" : "유주택"} />
        <Row label="세대주" value={profile.isHeadOfHousehold ? "예" : "아니오"} />
        <Row label="예산 상한" value={profile.budgetMax ? formatPrice(profile.budgetMax) : "미설정"} />
        <Row label="청약통장" value={profile.hasSubscriptionAccount ? `${profile.subscriptionPeriodMonths}개월` : "미보유"} />
        <Row label="특별공급" value={specialText} />
        <Link to="/onboarding" className="inset-group__row" style={{ cursor: "pointer" }}>
          <span style={{ color: "var(--c-blue)", fontSize: 15 }}>조건 재설정</span>
          <span style={{ color: "var(--c-label4)" }}>›</span>
        </Link>
      </div>

      {/* 저장 현황 */}
      <SectionLabel>저장 현황</SectionLabel>
      <div className="inset-group">
        <Link to="/saved" className="inset-group__row" style={{ cursor: "pointer" }}>
          <span className="inset-group__label">관심 단지</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--c-label3)" }}>
            {savedOfferingIds.length}건
            <span style={{ color: "var(--c-label4)" }}>›</span>
          </span>
        </Link>
        <Link to="/compare" className="inset-group__row" style={{ cursor: "pointer" }}>
          <span className="inset-group__label">비교함</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--c-label3)" }}>
            {comparisonIds.length}건
            <span style={{ color: "var(--c-label4)" }}>›</span>
          </span>
        </Link>
        <Link to="/alerts" className="inset-group__row" style={{ cursor: "pointer" }}>
          <span className="inset-group__label">알림 설정</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--c-label3)" }}>
            {alertedOfferingIds.length}건
            <span style={{ color: "var(--c-label4)" }}>›</span>
          </span>
        </Link>
      </div>

      {/* 빠른 도구 */}
      <SectionLabel>도구</SectionLabel>
      <div className="inset-group">
        <Link to="/eligibility" className="inset-group__row" style={{ cursor: "pointer" }}>
          <span className="inset-group__label">자격 진단</span>
          <span style={{ color: "var(--c-label4)" }}>›</span>
        </Link>
        <Link to="/score" className="inset-group__row" style={{ cursor: "pointer" }}>
          <span className="inset-group__label">가점 계산</span>
          <span style={{ color: "var(--c-label4)" }}>›</span>
        </Link>
        <Link to="/schedule" className="inset-group__row" style={{ cursor: "pointer" }}>
          <span className="inset-group__label">일정 캘린더</span>
          <span style={{ color: "var(--c-label4)" }}>›</span>
        </Link>
      </div>

      {/* 로그아웃 */}
      {user && (
        <>
          <SectionLabel />
          <div className="inset-group">
            <button
              type="button"
              onClick={() => logout()}
              className="inset-group__row"
              style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "center" }}
            >
              <span style={{ color: "var(--c-red)", fontSize: 15, fontWeight: 500, width: "100%", textAlign: "center" }}>
                로그아웃
              </span>
            </button>
          </div>
        </>
      )}

      <div style={{ height: 16 }} />
    </div>
  );
}

function SectionLabel({ children }: { children?: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 13,
      fontWeight: 600,
      color: "var(--c-label3)",
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",
      padding: "20px 16px 6px",
    }}>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="inset-group__row">
      <span className="inset-group__label">{label}</span>
      <span className="inset-group__value">{value}</span>
    </div>
  );
}
