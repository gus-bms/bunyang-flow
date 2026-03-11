import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { checkEligibility } from "../lib/api";
import { usePreferenceStore } from "../store/preferences";

const specialSupplyOptions = [
  { value: "newlywed" as const, label: "신혼부부" },
  { value: "first_time_buyer" as const, label: "생애최초" },
  { value: "multi_child" as const, label: "다자녀" },
  { value: "elder_support" as const, label: "노부모부양" },
] as const;

export function EligibilityPage() {
  const profile = usePreferenceStore((s) => s.profile);
  const updateProfile = usePreferenceStore((s) => s.updateProfile);
  const [form, setForm] = useState(profile);

  const mutation = useMutation({ mutationFn: checkEligibility });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    updateProfile(form);
    mutation.mutate(form);
  }

  function toggleSpecial(value: (typeof specialSupplyOptions)[number]["value"]) {
    setForm((c) => ({
      ...c,
      specialSupplyFlags: c.specialSupplyFlags.includes(value)
        ? c.specialSupplyFlags.filter((f) => f !== value)
        : [...c.specialSupplyFlags, value],
    }));
  }

  const resultLink = mutation.data?.eligibleSupplyTypes.length
    ? `/offerings?stages=special_supply_open,priority_1_open,priority_2_open`
    : `/offerings`;

  return (
    <div className="page-stack">
      <div style={{ padding: "16px 16px 0" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>자격 진단</h2>
        <p style={{ fontSize: 14, color: "var(--c-label3)", margin: "4px 0 0" }}>
          지원 가능한 공급 유형을 빠르게 확인합니다
        </p>
      </div>

      <form onSubmit={submit} style={{ margin: "12px 16px 0", display: "grid", gap: 0 }}>
        {/* 지역 */}
        <div className="inset-group" style={{ marginBottom: 16 }}>
          <label className="inset-group__row" style={{ cursor: "pointer" }}>
            <span className="inset-group__label">거주 지역</span>
            <select
              value={form.residenceRegion1}
              onChange={(e) => setForm((c) => ({ ...c, residenceRegion1: e.target.value }))}
              style={{ border: "none", background: "transparent", fontSize: 15, color: "var(--c-label3)", textAlign: "right", outline: "none" }}
            >
              <option value="서울">서울</option>
              <option value="경기">경기</option>
              <option value="인천">인천</option>
            </select>
          </label>
          <label className="inset-group__row" style={{ cursor: "pointer" }}>
            <span className="inset-group__label">무주택</span>
            <input
              type="checkbox"
              checked={form.isHomeless}
              onChange={(e) => setForm((c) => ({ ...c, isHomeless: e.target.checked }))}
              style={{ width: 20, height: 20, accentColor: "var(--c-blue)" }}
            />
          </label>
          <label className="inset-group__row" style={{ cursor: "pointer" }}>
            <span className="inset-group__label">세대주</span>
            <input
              type="checkbox"
              checked={form.isHeadOfHousehold}
              onChange={(e) => setForm((c) => ({ ...c, isHeadOfHousehold: e.target.checked }))}
              style={{ width: 20, height: 20, accentColor: "var(--c-blue)" }}
            />
          </label>
          <label className="inset-group__row" style={{ cursor: "pointer" }}>
            <span className="inset-group__label">청약통장 보유</span>
            <input
              type="checkbox"
              checked={form.hasSubscriptionAccount}
              onChange={(e) => setForm((c) => ({ ...c, hasSubscriptionAccount: e.target.checked }))}
              style={{ width: 20, height: 20, accentColor: "var(--c-blue)" }}
            />
          </label>
          {form.hasSubscriptionAccount && (
            <label className="inset-group__row">
              <span className="inset-group__label">가입 개월</span>
              <input
                type="number"
                min={0}
                value={form.subscriptionPeriodMonths}
                onChange={(e) => setForm((c) => ({ ...c, subscriptionPeriodMonths: Number(e.target.value) }))}
                style={{ border: "none", background: "transparent", fontSize: 15, color: "var(--c-label3)", textAlign: "right", width: 80, outline: "none" }}
              />
            </label>
          )}
        </div>

        {/* 특별공급 */}
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-label3)", textTransform: "uppercase" as const, letterSpacing: "0.05em", padding: "0 0 6px" }}>
          특별공급 대상
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {specialSupplyOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={form.specialSupplyFlags.includes(opt.value) ? "filter-chip is-active" : "filter-chip"}
              onClick={() => toggleSpecial(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button type="submit" className="primary-button" style={{ width: "100%", borderRadius: 12 }}>
          진단 실행
        </button>
      </form>

      {/* 결과 */}
      {mutation.data && (
        <div style={{ margin: "16px 16px 0" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-label3)", textTransform: "uppercase" as const, letterSpacing: "0.05em", padding: "0 0 6px" }}>
            진단 결과
          </div>
          <div className="inset-group">
            <div className="inset-group__row">
              <span className="inset-group__label">지원 가능</span>
              <span className="inset-group__value" style={{ color: "var(--c-blue)", fontWeight: 600 }}>
                {mutation.data.eligibleSupplyTypes.join(", ") || "확인 필요"}
              </span>
            </div>
            {mutation.data.requiresReview.map((item) => (
              <div key={item} className="inset-group__row">
                <span className="inset-group__label" style={{ color: "var(--c-orange)" }}>{item}</span>
              </div>
            ))}
            {mutation.data.cautions.map((item) => (
              <div key={item} className="inset-group__row">
                <span className="inset-group__label" style={{ color: "var(--c-red)" }}>{item}</span>
              </div>
            ))}
          </div>
          <Link
            to={resultLink}
            className="primary-link"
            style={{ width: "100%", marginTop: 12, borderRadius: 12, display: "flex" }}
          >
            해당 단지 보기
          </Link>
        </div>
      )}

      <div style={{ height: 16 }} />
    </div>
  );
}
