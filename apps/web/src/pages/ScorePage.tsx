import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { OfferingCard } from "../components/offerings/OfferingCard";
import { calculateScore, getOfferings } from "../lib/api";

export function ScorePage() {
  const [form, setForm] = useState({
    homelessPeriodYears: 12,
    dependentCount: 3,
    subscriptionPeriodYears: 10,
  });

  const offeringsQuery = useQuery({
    queryKey: ["offerings", "score-page"],
    queryFn: () => getOfferings(),
  });

  const mutation = useMutation({ mutationFn: calculateScore });

  const recommended = useMemo(() => {
    const score = mutation.data?.totalScore;
    if (!score) return [];
    return (offeringsQuery.data?.items ?? []).filter((o) =>
      o.competitionRates.some((r) => !r.minWinningScore || score >= r.minWinningScore - 3),
    );
  }, [mutation.data, offeringsQuery.data?.items]);

  return (
    <div className="page-stack">
      <div style={{ padding: "16px 16px 0" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>가점 계산</h2>
        <p style={{ fontSize: 14, color: "var(--c-label3)", margin: "4px 0 0" }}>84점 만점 기준</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }}
        style={{ margin: "12px 16px 0", display: "grid", gap: 0 }}
      >
        <div className="inset-group" style={{ marginBottom: 16 }}>
          <div className="inset-group__row" style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15 }}>무주택 기간</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--c-blue)" }}>{form.homelessPeriodYears}년</span>
            </div>
            <input
              type="range" min={0} max={15} step={1} value={form.homelessPeriodYears}
              onChange={(e) => setForm((c) => ({ ...c, homelessPeriodYears: Number(e.target.value) }))}
              style={{ accentColor: "var(--c-blue)" }}
            />
            <div className="range-labels"><span>0년</span><span>15년+</span></div>
          </div>

          <div className="inset-group__row" style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15 }}>부양가족 수</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--c-blue)" }}>{form.dependentCount}명</span>
            </div>
            <input
              type="range" min={0} max={6} step={1} value={form.dependentCount}
              onChange={(e) => setForm((c) => ({ ...c, dependentCount: Number(e.target.value) }))}
              style={{ accentColor: "var(--c-blue)" }}
            />
            <div className="range-labels"><span>0명</span><span>6명+</span></div>
          </div>

          <div className="inset-group__row" style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15 }}>청약통장 기간</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--c-blue)" }}>{form.subscriptionPeriodYears}년</span>
            </div>
            <input
              type="range" min={0} max={15} step={1} value={form.subscriptionPeriodYears}
              onChange={(e) => setForm((c) => ({ ...c, subscriptionPeriodYears: Number(e.target.value) }))}
              style={{ accentColor: "var(--c-blue)" }}
            />
            <div className="range-labels"><span>0년</span><span>15년+</span></div>
          </div>
        </div>

        <button type="submit" className="primary-button" style={{ width: "100%", borderRadius: 12 }}>
          가점 계산
        </button>
      </form>

      {/* 결과 */}
      {mutation.data && (
        <div style={{ padding: "16px 16px 0" }}>
          <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 20, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 13, color: "var(--c-label3)", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
              총 가점
            </div>
            <div style={{ fontSize: 48, fontWeight: 700, color: "var(--c-blue)", lineHeight: 1.1, margin: "8px 0" }}>
              {mutation.data.totalScore}
            </div>
            <div style={{ fontSize: 15, color: "var(--c-label3)" }}>/ 84점</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
            <div className="metric-card" style={{ textAlign: "center" }}>
              <div className="metric-card__label">무주택</div>
              <div className="metric-card__value">{mutation.data.homelessScore}</div>
              <span style={{ fontSize: 11, color: "var(--c-label4)" }}>/32</span>
            </div>
            <div className="metric-card" style={{ textAlign: "center" }}>
              <div className="metric-card__label">부양가족</div>
              <div className="metric-card__value">{mutation.data.dependentScore}</div>
              <span style={{ fontSize: 11, color: "var(--c-label4)" }}>/35</span>
            </div>
            <div className="metric-card" style={{ textAlign: "center" }}>
              <div className="metric-card__label">통장</div>
              <div className="metric-card__value">{mutation.data.subscriptionScore}</div>
              <span style={{ fontSize: 11, color: "var(--c-label4)" }}>/17</span>
            </div>
          </div>

          <p style={{ fontSize: 14, color: "var(--c-label3)", marginTop: 12, textAlign: "center" }}>
            {mutation.data.assessmentLabel}
          </p>
        </div>
      )}

      {/* 추천 단지 */}
      {recommended.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ padding: "16px 16px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.4px" }}>도전해볼 단지</h3>
            <span style={{ fontSize: 13, color: "var(--c-label3)" }}>내 가점 기준</span>
          </div>
          <div className="card-scroll">
            {recommended.map((o) => <OfferingCard key={o.id} offering={o} />)}
          </div>
        </div>
      )}

      <div style={{ height: 16 }} />
    </div>
  );
}
