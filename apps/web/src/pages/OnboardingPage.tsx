import { useNavigate } from "react-router-dom";
import { startTransition, useState } from "react";

import { PageHeader } from "../components/common/PageHeader";
import { usePreferenceStore } from "../store/preferences";

const specialSupplyOptions = [
  { value: "newlywed", label: "신혼부부" },
  { value: "first_time_buyer", label: "생애최초" },
  { value: "multi_child", label: "다자녀" },
] as const;

export function OnboardingPage() {
  const navigate = useNavigate();
  const profile = usePreferenceStore((state) => state.profile);
  const updateProfile = usePreferenceStore((state) => state.updateProfile);
  const completeOnboarding = usePreferenceStore((state) => state.completeOnboarding);
  const [budgetMax, setBudgetMax] = useState(profile.budgetMax ?? 800000000);
  const [region, setRegion] = useState(profile.residenceRegion1);

  return (
    <div className="page-stack">
      <PageHeader
        title="온보딩"
        description="서비스 소개 대신 바로 개인화 조건을 잡고 홈 추천으로 연결하는 흐름입니다."
      />

      <section className="panel form-stack">
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

        <label className="field">
          <span>예산 상한</span>
          <input
            type="range"
            min={300000000}
            max={1200000000}
            step={10000000}
            value={budgetMax}
            onChange={(event) => setBudgetMax(Number(event.target.value))}
          />
          <strong>{Math.round(budgetMax / 100000000)}억 이하</strong>
        </label>

        <div className="field">
          <span>특별공급 대상</span>
          <div className="chip-row">
            {specialSupplyOptions.map((option) => {
              const selected = profile.specialSupplyFlags.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  className={selected ? "filter-chip is-active" : "filter-chip"}
                  onClick={() => {
                    const nextFlags = selected
                      ? profile.specialSupplyFlags.filter((item) => item !== option.value)
                      : [...profile.specialSupplyFlags, option.value];
                    updateProfile({ specialSupplyFlags: nextFlags });
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => {
            updateProfile({
              residenceRegion1: region,
              budgetMax,
            });
            completeOnboarding();
            startTransition(() => navigate("/"));
          }}
        >
          맞춤 추천 보기
        </button>
      </section>
    </div>
  );
}
