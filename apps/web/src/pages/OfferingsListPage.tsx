import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { offeringStages, type OfferingType } from "@bunyang-flow/shared";
import { Link } from "react-router-dom";

import { OfferingCard } from "../components/offerings/OfferingCard";
import { getOfferings } from "../lib/api";
import { formatPrice, getStageDisplay } from "../lib/format";

type SortKey = "actionable" | "schedule" | "latest";

export function OfferingsListPage() {
  const [search, setSearch] = useState("");
  const [selectedStages, setSelectedStages] = useState<string[]>([
    "special_supply_open",
    "announcement_open",
  ]);
  const [region, setRegion] = useState("서울");
  const [maxPrice, setMaxPrice] = useState(0);
  const [offeringType, setOfferingType] = useState<OfferingType | "">("");
  const [sortKey, setSortKey] = useState<SortKey>("actionable");
  const [showFilters, setShowFilters] = useState(false);
  const deferredSearch = useDeferredValue(search);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedStages.length) params.set("stages", selectedStages.join(","));
    if (region) params.set("region", region);
    if (maxPrice > 0) params.set("maxPrice", String(maxPrice));
    if (offeringType) params.set("offeringType", offeringType);
    return params;
  }, [region, selectedStages, maxPrice, offeringType]);

  const { data } = useQuery({
    queryKey: ["offerings", queryString.toString()],
    queryFn: () => getOfferings(queryString),
  });

  const stageOrder = offeringStages;

  const filteredItems = useMemo(() => {
    const base = (data?.items ?? []).filter((item) =>
      `${item.complexName} ${item.regionLabel}`.toLowerCase().includes(deferredSearch.toLowerCase()),
    );
    if (sortKey === "schedule") return [...base].sort((a, b) => a.nextScheduleAt.localeCompare(b.nextScheduleAt));
    if (sortKey === "latest") return [...base].sort((a, b) => b.announcementDate.localeCompare(a.announcementDate));
    return [...base].sort((a, b) => stageOrder.indexOf(a.currentStage) - stageOrder.indexOf(b.currentStage));
  }, [data, deferredSearch, sortKey, stageOrder]);

  function toggleStage(stage: string) {
    setSelectedStages((c) => (c.includes(stage) ? c.filter((s) => s !== stage) : [...c, stage]));
  }

  return (
    <div className="page-stack">
      {/* 헤더 */}
      <div style={{ padding: "16px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>분양 찾기</h2>
        <Link to="/offerings/map" style={{ fontSize: 15, color: "var(--c-blue)", fontWeight: 500 }}>
          지도
        </Link>
      </div>

      {/* 검색 바 */}
      <div style={{ padding: "8px 16px" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="단지명, 지역 검색"
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            border: "none",
            background: "rgba(142,142,147,0.12)",
            fontSize: 16,
            outline: "none",
          }}
        />
      </div>

      {/* 단계 필터 칩 */}
      <div className="chip-row" style={{ paddingBottom: 4 }}>
        {offeringStages
          .filter((s) => s !== "closed")
          .map((stage) => (
            <button
              key={stage}
              type="button"
              className={selectedStages.includes(stage) ? "filter-chip is-active" : "filter-chip"}
              onClick={() => toggleStage(stage)}
            >
              {getStageDisplay(stage)}
            </button>
          ))}
      </div>

      {/* 상세 필터 토글 */}
      <div style={{ padding: "0 16px" }}>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          style={{
            background: "none",
            border: "none",
            color: "var(--c-blue)",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            padding: 0,
          }}
        >
          {showFilters ? "필터 접기" : "상세 필터 펼치기"}
        </button>
      </div>

      {/* 상세 필터 패널 */}
      {showFilters && (
        <div
          style={{
            margin: "4px 16px 0",
            background: "var(--c-surface)",
            borderRadius: 14,
            padding: 16,
            display: "grid",
            gap: 14,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <label className="field">
            <span>지역</span>
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="">전체</option>
              <option value="서울">서울</option>
              <option value="경기">경기</option>
              <option value="인천">인천</option>
            </select>
          </label>

          <label className="field">
            <span>분양가 — {maxPrice > 0 ? `${formatPrice(maxPrice)} 이하` : "제한 없음"}</span>
            <input
              type="range"
              min={0}
              max={1500000000}
              step={10000000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
            <div className="range-labels">
              <span>제한 없음</span>
              <span>15억</span>
            </div>
          </label>

          <div className="field">
            <span>공급 유형</span>
            <div style={{ display: "flex", gap: 8 }}>
              {(["", "private_sale", "public_sale"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={offeringType === type ? "filter-chip is-active" : "filter-chip"}
                  onClick={() => setOfferingType(type)}
                >
                  {type === "" ? "전체" : type === "private_sale" ? "민간" : "공공"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 정렬 + 결과 수 */}
      <div style={{ padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--c-label3)" }}>{filteredItems.length}건</span>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          style={{
            border: "1px solid var(--c-sep)",
            borderRadius: 8,
            padding: "6px 10px",
            background: "var(--c-surface)",
            fontSize: 13,
          }}
        >
          <option value="actionable">접수 가능순</option>
          <option value="schedule">일정 임박순</option>
          <option value="latest">최신 공고순</option>
        </select>
      </div>

      {/* 카드 리스트 */}
      <div className="card-grid">
        {filteredItems.length === 0 ? (
          <div
            style={{
              background: "var(--c-surface)",
              borderRadius: 14,
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--c-label3)",
            }}
          >
            조건에 맞는 단지가 없습니다
          </div>
        ) : (
          filteredItems.map((offering) => (
            <OfferingCard key={offering.id} offering={offering} />
          ))
        )}
      </div>
    </div>
  );
}
