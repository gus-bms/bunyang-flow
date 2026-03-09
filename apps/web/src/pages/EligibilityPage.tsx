import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { PageHeader } from "../components/common/PageHeader";
import { checkEligibility } from "../lib/api";
import { usePreferenceStore } from "../store/preferences";

export function EligibilityPage() {
  const profile = usePreferenceStore((state) => state.profile);
  const updateProfile = usePreferenceStore((state) => state.updateProfile);
  const [form, setForm] = useState(profile);

  const mutation = useMutation({
    mutationFn: checkEligibility,
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateProfile(form);
    mutation.mutate(form);
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="청약 자격 진단"
        description="확정 판단이 아니라, 지금 볼 가치가 있는 공급 유형을 빠르게 가려내는 용도입니다."
      />

      <form
        className="panel form-stack"
        onSubmit={submit}
      >
        <label className="field">
          <span>거주 지역</span>
          <select
            value={form.residenceRegion1}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                residenceRegion1: event.target.value,
              }))
            }
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
              checked={form.isHomeless}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isHomeless: event.target.checked,
                }))
              }
            />
            무주택
          </label>
          <label className="toggle-field">
            <input
              type="checkbox"
              checked={form.isHeadOfHousehold}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isHeadOfHousehold: event.target.checked,
                }))
              }
            />
            세대주
          </label>
        </div>

        <label className="field">
          <span>청약통장 가입 개월 수</span>
          <input
            type="number"
            value={form.subscriptionPeriodMonths}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                subscriptionPeriodMonths: Number(event.target.value),
              }))
            }
          />
        </label>

        <button
          type="submit"
          className="primary-button"
        >
          진단 실행
        </button>
      </form>

      {mutation.data ? (
        <section className="panel">
          <p className="eyebrow">진단 결과</p>
          <h3>{mutation.data.eligibleSupplyTypes.join(", ") || "우선 일반공급 기준부터 확인 필요"}</h3>
          <div className="list-stack">
            {mutation.data.requiresReview.map((item) => (
              <p key={item}>{item}</p>
            ))}
            {mutation.data.cautions.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
