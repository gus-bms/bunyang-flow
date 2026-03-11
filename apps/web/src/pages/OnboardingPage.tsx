import { useNavigate } from "react-router-dom";
import { startTransition, useState } from "react";
import type { SpecialSupplyType } from "@bunyang-flow/shared";

import { usePreferenceStore } from "../store/preferences";

const TOTAL_STEPS = 3;

const specialSupplyOptions: { value: SpecialSupplyType; label: string }[] = [
  { value: "newlywed", label: "신혼부부" },
  { value: "first_time_buyer", label: "생애최초" },
  { value: "multi_child", label: "다자녀" },
  { value: "elder_support", label: "노부모부양" },
];

const stepTitles = ["지역 및 주택 상태", "예산 및 청약통장", "특별공급 대상"];

const introSlides = [
  { icon: "🏠", title: "분양과 청약에 필요한\n정보만 모았어요", description: "복잡한 부동산 정보 대신, 분양 공고와 청약 일정만 집중적으로 제공합니다." },
  { icon: "🎯", title: "내 조건에 맞는\n단지를 추천받으세요", description: "지역, 예산, 무주택 여부를 입력하면 맞춤 단지를 찾아드립니다." },
  { icon: "🔔", title: "일정 알림으로\n청약을 놓치지 마세요", description: "1순위 접수일, 당첨자 발표, 계약 일정을 미리 알림으로 받아보세요." },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const profile = usePreferenceStore((s) => s.profile);
  const updateProfile = usePreferenceStore((s) => s.updateProfile);
  const completeOnboarding = usePreferenceStore((s) => s.completeOnboarding);

  const [showIntro, setShowIntro] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [region, setRegion] = useState(profile.residenceRegion1);
  const [isHomeless, setIsHomeless] = useState(profile.isHomeless);
  const [isHeadOfHousehold, setIsHeadOfHousehold] = useState(profile.isHeadOfHousehold);
  const [budgetMax, setBudgetMax] = useState(profile.budgetMax ?? 800000000);
  const [hasSubscriptionAccount, setHasSubscriptionAccount] = useState(profile.hasSubscriptionAccount);
  const [subscriptionPeriodMonths, setSubscriptionPeriodMonths] = useState(profile.subscriptionPeriodMonths);
  const [specialSupplyFlags, setSpecialSupplyFlags] = useState<SpecialSupplyType[]>(profile.specialSupplyFlags);

  function toggleSpecial(value: SpecialSupplyType) {
    setSpecialSupplyFlags((c) => c.includes(value) ? c.filter((f) => f !== value) : [...c, value]);
  }

  function handleFinish() {
    updateProfile({ residenceRegion1: region, isHomeless, isHeadOfHousehold, budgetMax, hasSubscriptionAccount, subscriptionPeriodMonths, specialSupplyFlags });
    completeOnboarding();
    startTransition(() => navigate("/"));
  }

  /* ── 인트로 슬라이드 ── */
  if (showIntro) {
    const slide = introSlides[slideIndex];
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px 24px 48px" }}>
        <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
          <div style={{ fontSize: 64, lineHeight: 1 }}>{slide.icon}</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.3, margin: 0, whiteSpace: "pre-line", letterSpacing: "-0.5px" }}>
            {slide.title}
          </h2>
          <p style={{ fontSize: 16, color: "var(--c-label3)", lineHeight: 1.6, margin: 0 }}>{slide.description}</p>
        </div>

        {/* 인디케이터 */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
          {introSlides.map((_, i) => (
            <span
              key={i}
              onClick={() => setSlideIndex(i)}
              style={{
                width: i === slideIndex ? 20 : 8,
                height: 8,
                borderRadius: 999,
                background: i === slideIndex ? "var(--c-blue)" : "var(--c-bg2)",
                cursor: "pointer",
                transition: "width 200ms, background 200ms",
              }}
            />
          ))}
        </div>

        {/* 버튼 */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => setShowIntro(false)}
            style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: "1px solid var(--c-sep)", background: "var(--c-surface)", fontSize: 16, fontWeight: 600, cursor: "pointer", color: "var(--c-label)" }}
          >
            건너뛰기
          </button>
          <button
            type="button"
            onClick={() => slideIndex < introSlides.length - 1 ? setSlideIndex((i) => i + 1) : setShowIntro(false)}
            style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: "none", background: "var(--c-blue)", color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer" }}
          >
            {slideIndex < introSlides.length - 1 ? "다음" : "시작하기"}
          </button>
        </div>
      </div>
    );
  }

  /* ── 설정 폼 ── */
  return (
    <div className="page-stack">
      <div style={{ padding: "16px 16px 0" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>{stepTitles[step]}</h2>
      </div>

      {/* 스텝 인디케이터 */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "12px 0 4px" }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <span
            key={i}
            style={{
              width: i === step ? 20 : 8,
              height: 8,
              borderRadius: 999,
              background: i === step ? "var(--c-blue)" : i < step ? "var(--c-label4)" : "var(--c-bg2)",
              transition: "width 200ms, background 200ms",
            }}
          />
        ))}
      </div>

      {/* Step 0: 지역 + 무주택 + 세대주 */}
      {step === 0 && (
        <div className="inset-group" style={{ margin: "12px 16px 0" }}>
          <label className="inset-group__row" style={{ cursor: "pointer" }}>
            <span className="inset-group__label">관심 지역</span>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{ border: "none", background: "transparent", fontSize: 15, color: "var(--c-label3)", textAlign: "right", outline: "none" }}
            >
              <option value="서울">서울</option>
              <option value="경기">경기</option>
              <option value="인천">인천</option>
            </select>
          </label>
          <label className="inset-group__row" style={{ cursor: "pointer" }}>
            <span className="inset-group__label">무주택</span>
            <input type="checkbox" checked={isHomeless} onChange={(e) => setIsHomeless(e.target.checked)} style={{ width: 20, height: 20, accentColor: "var(--c-blue)" }} />
          </label>
          <label className="inset-group__row" style={{ cursor: "pointer" }}>
            <span className="inset-group__label">세대주</span>
            <input type="checkbox" checked={isHeadOfHousehold} onChange={(e) => setIsHeadOfHousehold(e.target.checked)} style={{ width: 20, height: 20, accentColor: "var(--c-blue)" }} />
          </label>
        </div>
      )}

      {/* Step 1: 예산 + 통장 */}
      {step === 1 && (
        <div style={{ margin: "12px 16px 0", display: "grid", gap: 12 }}>
          <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 16, display: "grid", gap: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15 }}>예산 상한</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--c-blue)" }}>{Math.round(budgetMax / 100000000)}억</span>
            </div>
            <input
              type="range" min={300000000} max={1200000000} step={10000000} value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
              style={{ accentColor: "var(--c-blue)" }}
            />
            <div className="range-labels"><span>3억</span><span>12억</span></div>
          </div>

          <div className="inset-group">
            <label className="inset-group__row" style={{ cursor: "pointer" }}>
              <span className="inset-group__label">청약통장 보유</span>
              <input type="checkbox" checked={hasSubscriptionAccount} onChange={(e) => setHasSubscriptionAccount(e.target.checked)} style={{ width: 20, height: 20, accentColor: "var(--c-blue)" }} />
            </label>
            {hasSubscriptionAccount && (
              <div className="inset-group__row" style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 15 }}>가입 기간</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "var(--c-blue)" }}>{subscriptionPeriodMonths}개월</span>
                </div>
                <input
                  type="range" min={0} max={180} step={6} value={subscriptionPeriodMonths}
                  onChange={(e) => setSubscriptionPeriodMonths(Number(e.target.value))}
                  style={{ accentColor: "var(--c-blue)" }}
                />
                <div className="range-labels"><span>0개월</span><span>15년</span></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: 특별공급 */}
      {step === 2 && (
        <div style={{ margin: "12px 16px 0" }}>
          <p style={{ fontSize: 14, color: "var(--c-label3)", margin: "0 0 12px" }}>해당하는 유형을 모두 선택하세요</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {specialSupplyOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={specialSupplyFlags.includes(opt.value) ? "filter-chip is-active" : "filter-chip"}
                onClick={() => toggleSpecial(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "var(--c-label4)", marginTop: 12 }}>없으면 선택하지 않고 완료하세요.</p>
        </div>
      )}

      {/* 네비게이션 */}
      <div style={{ display: "flex", gap: 10, padding: "20px 16px 0" }}>
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((c) => c - 1)}
            style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: "1px solid var(--c-sep)", background: "var(--c-surface)", fontSize: 16, fontWeight: 600, cursor: "pointer", color: "var(--c-label)" }}
          >
            이전
          </button>
        ) : <div style={{ flex: 1 }} />}

        <button
          type="button"
          onClick={() => step < TOTAL_STEPS - 1 ? setStep((c) => c + 1) : handleFinish()}
          style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: "none", background: "var(--c-blue)", color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer" }}
        >
          {step < TOTAL_STEPS - 1 ? "다음" : "맞춤 추천 보기"}
        </button>
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}
