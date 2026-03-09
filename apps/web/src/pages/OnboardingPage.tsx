import { useNavigate } from "react-router-dom";
import { startTransition, useState } from "react";
import type { SpecialSupplyType } from "@bunyang-flow/shared";

import { PageHeader } from "../components/common/PageHeader";
import { usePreferenceStore } from "../store/preferences";

const TOTAL_STEPS = 3;

const specialSupplyOptions: { value: SpecialSupplyType; label: string }[] = [
  { value: "newlywed", label: "신혼부부" },
  { value: "first_time_buyer", label: "생애최초" },
  { value: "multi_child", label: "다자녀" },
  { value: "elder_support", label: "노부모부양" },
];

const stepTitles = ["지역 및 주택 상태", "예산 및 청약통장", "특별공급 대상"];
const stepDescriptions = [
  "현재 거주 지역과 주택 보유 현황을 입력합니다.",
  "청약 예산과 청약통장 가입 기간을 설정합니다.",
  "해당하는 특별공급 유형을 선택합니다.",
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const profile = usePreferenceStore((state) => state.profile);
  const updateProfile = usePreferenceStore((state) => state.updateProfile);
  const completeOnboarding = usePreferenceStore((state) => state.completeOnboarding);

  const [step, setStep] = useState(0);
  const [region, setRegion] = useState(profile.residenceRegion1);
  const [isHomeless, setIsHomeless] = useState(profile.isHomeless);
  const [isHeadOfHousehold, setIsHeadOfHousehold] = useState(profile.isHeadOfHousehold);
  const [budgetMax, setBudgetMax] = useState(profile.budgetMax ?? 800000000);
  const [hasSubscriptionAccount, setHasSubscriptionAccount] = useState(
    profile.hasSubscriptionAccount,
  );
  const [subscriptionPeriodMonths, setSubscriptionPeriodMonths] = useState(
    profile.subscriptionPeriodMonths,
  );
  const [specialSupplyFlags, setSpecialSupplyFlags] = useState<SpecialSupplyType[]>(
    profile.specialSupplyFlags,
  );

  function toggleSpecialSupply(value: SpecialSupplyType) {
    setSpecialSupplyFlags((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  function handleFinish() {
    updateProfile({
      residenceRegion1: region,
      isHomeless,
      isHeadOfHousehold,
      budgetMax,
      hasSubscriptionAccount,
      subscriptionPeriodMonths,
      specialSupplyFlags,
    });
    completeOnboarding();
    startTransition(() => navigate("/"));
  }

  return (
    <div className="page-stack">
      <PageHeader
        title={stepTitles[step]}
        description={stepDescriptions[step]}
      />

      <div className="step-indicator">
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
          <span
            key={index}
            className={
              index === step
                ? "step-dot step-dot--active"
                : index < step
                  ? "step-dot step-dot--done"
                  : "step-dot"
            }
          />
        ))}
      </div>

      <section className="panel form-stack">
        {step === 0 && (
          <>
            <label className="field">
              <span>관심 지역</span>
              <select
                value={region}
                onChange={(event) => setRegion(event.target.value)}
              >
                <option value="서울">서울</option>
                <option value="경기">경기</option>
                <option value="인천">인천</option>
              </select>
            </label>

            <div className="inline-fields">
              <label className="toggle-field">
                <input
                  type="checkbox"
                  checked={isHomeless}
                  onChange={(event) => setIsHomeless(event.target.checked)}
                />
                무주택
              </label>
              <label className="toggle-field">
                <input
                  type="checkbox"
                  checked={isHeadOfHousehold}
                  onChange={(event) => setIsHeadOfHousehold(event.target.checked)}
                />
                세대주
              </label>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <label className="field">
              <span>예산 상한 — {Math.round(budgetMax / 100000000)}억 이하</span>
              <input
                type="range"
                min={300000000}
                max={1200000000}
                step={10000000}
                value={budgetMax}
                onChange={(event) => setBudgetMax(Number(event.target.value))}
              />
              <div className="range-labels">
                <span>3억</span>
                <span>12억</span>
              </div>
            </label>

            <label className="toggle-field">
              <input
                type="checkbox"
                checked={hasSubscriptionAccount}
                onChange={(event) => setHasSubscriptionAccount(event.target.checked)}
              />
              청약통장 보유
            </label>

            {hasSubscriptionAccount && (
              <label className="field">
                <span>청약통장 가입 기간 — {subscriptionPeriodMonths}개월</span>
                <input
                  type="range"
                  min={0}
                  max={180}
                  step={6}
                  value={subscriptionPeriodMonths}
                  onChange={(event) =>
                    setSubscriptionPeriodMonths(Number(event.target.value))
                  }
                />
                <div className="range-labels">
                  <span>0개월</span>
                  <span>15년</span>
                </div>
              </label>
            )}
          </>
        )}

        {step === 2 && (
          <div className="field">
            <span>해당하는 특별공급 유형을 모두 선택하세요</span>
            <div className="chip-row">
              {specialSupplyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={
                    specialSupplyFlags.includes(option.value) ? "filter-chip is-active" : "filter-chip"
                  }
                  onClick={() => toggleSpecialSupply(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="muted">해당 없으면 선택하지 않고 다음 단계로 이동하세요.</p>
          </div>
        )}

        <div className="step-nav">
          {step > 0 ? (
            <button
              type="button"
              className="secondary-link"
              onClick={() => setStep((current) => current - 1)}
            >
              이전
            </button>
          ) : (
            <span />
          )}

          {step < TOTAL_STEPS - 1 ? (
            <button
              type="button"
              className="primary-button"
              onClick={() => setStep((current) => current + 1)}
            >
              다음
            </button>
          ) : (
            <button
              type="button"
              className="primary-button"
              onClick={handleFinish}
            >
              맞춤 추천 보기
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
