import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { PageHeader } from "../components/common/PageHeader";
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

  const mutation = useMutation({
    mutationFn: calculateScore,
  });

  const recommended = useMemo(() => {
    const score = mutation.data?.totalScore;
    if (!score) {
      return [];
    }

    return (offeringsQuery.data?.items ?? []).filter((offering) =>
      offering.competitionRates.some(
        (rate) => !rate.minWinningScore || score >= rate.minWinningScore - 3,
      ),
    );
  }, [mutation.data, offeringsQuery.data?.items]);

  return (
    <div className="page-stack">
      <PageHeader
        title="청약 가점 계산기"
        description="84점 만점 구조와 경쟁률 참고 데이터를 한 화면에서 보도록 설계했습니다."
      />

      <form
        className="panel form-stack"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate(form);
        }}
      >
        <label className="field">
          <span>무주택 기간(년)</span>
          <input
            type="number"
            value={form.homelessPeriodYears}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                homelessPeriodYears: Number(event.target.value),
              }))
            }
          />
        </label>

        <label className="field">
          <span>부양가족 수</span>
          <input
            type="number"
            value={form.dependentCount}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                dependentCount: Number(event.target.value),
              }))
            }
          />
        </label>

        <label className="field">
          <span>청약통장 가입 기간(년)</span>
          <input
            type="number"
            value={form.subscriptionPeriodYears}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                subscriptionPeriodYears: Number(event.target.value),
              }))
            }
          />
        </label>

        <button
          type="submit"
          className="primary-button"
        >
          가점 계산
        </button>
      </form>

      {mutation.data ? (
        <section className="panel">
          <p className="eyebrow">계산 결과</p>
          <h3>총 가점 {mutation.data.totalScore}점 / 84점</h3>
          <div className="detail-grid">
            <div className="metric-card">
              <span>무주택 기간</span>
              <strong>{mutation.data.homelessScore}점</strong>
            </div>
            <div className="metric-card">
              <span>부양가족</span>
              <strong>{mutation.data.dependentScore}점</strong>
            </div>
            <div className="metric-card">
              <span>통장 가입기간</span>
              <strong>{mutation.data.subscriptionScore}점</strong>
            </div>
          </div>
          <p className="muted">{mutation.data.assessmentLabel}</p>
        </section>
      ) : null}

      {recommended.length ? (
        <section className="panel">
          <p className="eyebrow">도전해볼 만한 단지</p>
          <div className="list-stack">
            {recommended.map((offering) => (
              <p key={offering.id}>
                {offering.complexName} / {offering.regionLabel} / {offering.currentStage}
              </p>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
