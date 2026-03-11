import { useState } from "react";
import { calculateFundingPlan } from "@bunyang-flow/shared";
import type { HousingType } from "@bunyang-flow/shared";
import { formatPrice } from "../../lib/format";

interface Props {
  housingTypes: HousingType[];
  contractDate?: string;
}

export function FundingSimulator({ housingTypes, contractDate }: Props) {
  const [selectedTypeId, setSelectedTypeId] = useState(housingTypes[0]?.id ?? "");
  const [selfFund, setSelfFund] = useState(100000000);
  const [showDetail, setShowDetail] = useState(false);

  const selectedType = housingTypes.find((t) => t.id === selectedTypeId);
  if (!selectedType) return null;

  const plan = calculateFundingPlan(
    selectedType,
    selfFund,
    contractDate ? new Date(contractDate) : undefined,
  );

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* 타입 선택 */}
      <div className="inset-group" style={{ margin: 0 }}>
        <label className="inset-group__row" style={{ cursor: "pointer" }}>
          <span className="inset-group__label">타입 선택</span>
          <select
            value={selectedTypeId}
            onChange={(e) => setSelectedTypeId(e.target.value)}
            style={{ border: "none", background: "transparent", fontSize: 15, color: "var(--c-label3)", textAlign: "right", outline: "none" }}
          >
            {housingTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.typeName} ({t.exclusiveAreaM2}㎡) — {formatPrice(t.salePriceMin)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* 자기 자금 슬라이더 */}
      <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 16, display: "grid", gap: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15 }}>자기 자금</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--c-blue)" }}>{formatPrice(selfFund)}</span>
        </div>
        <input
          type="range" min={0} max={plan.totalPrice} step={10000000} value={selfFund}
          onChange={(e) => setSelfFund(Number(e.target.value))}
          style={{ accentColor: "var(--c-blue)" }}
        />
        <div className="range-labels"><span>0원</span><span>{formatPrice(plan.totalPrice)}</span></div>
      </div>

      {/* 결과 메트릭 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className="metric-card">
          <div className="metric-card__label">분양가</div>
          <div className="metric-card__value">{formatPrice(plan.totalPrice)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">계약금</div>
          <div className="metric-card__value">{formatPrice(plan.depositAmount)}</div>
          <span style={{ fontSize: 11, color: "var(--c-label4)" }}>{selectedType.contractDepositRate}%</span>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">중도금</div>
          <div className="metric-card__value">{formatPrice(plan.interimTotal)}</div>
          <span style={{ fontSize: 11, color: "var(--c-label4)" }}>{selectedType.middlePaymentRate}% · 6회</span>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">잔금</div>
          <div className="metric-card__value">{formatPrice(plan.balanceAmount)}</div>
          <span style={{ fontSize: 11, color: "var(--c-label4)" }}>{selectedType.balanceRate}%</span>
        </div>
      </div>

      {/* 중도금 대출 */}
      {plan.interimLoanNeeded > 0 && (
        <div style={{ background: "rgba(0,122,255,0.06)", borderRadius: 14, padding: 16, display: "grid", gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-blue)", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
            중도금 대출 예상
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="metric-card" style={{ background: "var(--c-surface)" }}>
              <div className="metric-card__label">필요 대출액</div>
              <div className="metric-card__value">{formatPrice(plan.interimLoanNeeded)}</div>
            </div>
            <div className="metric-card" style={{ background: "var(--c-surface)" }}>
              <div className="metric-card__label">이자 참고값</div>
              <div className="metric-card__value">{formatPrice(plan.interimLoanInterestEst)}</div>
              <span style={{ fontSize: 11, color: "var(--c-label4)" }}>3.5% · 약 1.5년</span>
            </div>
          </div>
        </div>
      )}

      {/* 납입 회차 */}
      <button
        type="button"
        onClick={() => setShowDetail((v) => !v)}
        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "var(--c-blue)", fontWeight: 500, padding: "4px 0", textAlign: "left" }}
      >
        {showDetail ? "납입 계획 접기" : "납입 회차별 계획 보기"} {showDetail ? "▲" : "▼"}
      </button>

      {showDetail && (
        <div className="inset-group" style={{ margin: 0 }}>
          {plan.installments.map((item, idx) => (
            <div key={idx} className="inset-group__row">
              <span className="inset-group__label">{item.label}</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{formatPrice(item.amount)}</div>
                {item.dueDate && <div style={{ fontSize: 12, color: "var(--c-label4)" }}>{item.dueDate}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: 12, color: "var(--c-label4)", margin: 0, lineHeight: 1.5 }}>{plan.disclaimer}</p>
    </div>
  );
}
