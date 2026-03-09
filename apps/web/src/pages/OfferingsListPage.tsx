import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { offeringStages, type OfferingType } from "@bunyang-flow/shared";
import { Link } from "react-router-dom";

import { PageHeader } from "../components/common/PageHeader";
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
  const [maxPrice, setMaxPrice] = useState(0); // 0 = 제한 없음
  const [offeringType, setOfferingType] = useState<OfferingType | "">("");
  const [sortKey, setSortKey] = useState<SortKey>("actionable");
  const deferredSearch = useDeferredValue(search);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedStages.length) {
      params.set("stages", selectedStages.join(","));
    }
    if (region) {
      params.set("region", region);
    }
    if (maxPrice > 0) {
      params.set("maxPrice", String(maxPrice));
    }
    if (offeringType) {
      params.set("offeringType", offeringType);
    }
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

    if (sortKey === "schedule") {
      return [...base].sort((a, b) => a.nextScheduleAt.localeCompare(b.nextScheduleAt));
    }

    if (sortKey === "latest") {
      return [...base].sort((a, b) => b.announcementDate.localeCompare(a.announcementDate));
    }

    // 접수 가능 순: actionable stage를 먼저, 이후 단계 순
    return [...base].sort(
      (a, b) => stageOrder.indexOf(a.currentStage) - stageOrder.indexOf(b.currentStage),
    );
  }, [data, deferredSearch, sortKey, stageOrder]);

  function toggleStage(stage: string) {
    setSelectedStages((current) =>
      current.includes(stage)
        ? current.filter((item) => item !== stage)
        : [...current, stage],
    );
  }

  const activeFilters = [
    region ? `지역: ${region}` : null,
    maxPrice > 0 ? `분양가 ${formatPrice(maxPrice)} 이하` : null,
    offeringType === "private_sale" ? "민간분양" : offeringType === "public_sale" ? "공공분양" : null,
  ].filter(Boolean) as string[];

  return (
    <div className="page-stack">
      <PageHeader
        title="분양 찾기"
        description="분양 단계, 지역, 가격 중심으로 필터링해 일반 부동산 검색과 다른 흐름을 만듭니다."
        action={
          <Link
            className="secondary-link"
            to="/offerings/map"
          >
            지도 보기
          </Link>
        }
      />

      <section className="panel filter-panel">
        <label className="field">
          <span>검색</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="단지명, 지역명"
          />
        </label>

        <div className="field">
          <span>분양 단계</span>
          <div className="chip-row">
            {offeringStages
              .filter((stage) => stage !== "closed")
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
        </div>

        <label className="field">
          <span>지역</span>
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          >
            <option value="">전체</option>
            <option value="서울">서울</option>
            <option value="경기">경기</option>
            <option value="인천">인천</option>
          </select>
        </label>

        <label className="field">
          <span>
            분양가 상한 — {maxPrice > 0 ? `${formatPrice(maxPrice)} 이하` : "제한 없음"}
          </span>
          <input
            type="range"
            min={0}
            max={1500000000}
            step={10000000}
            value={maxPrice}
            onChange={(event) => setMaxPrice(Number(event.target.value))}
          />
          <div className="range-labels">
            <span>제한 없음</span>
            <span>15억</span>
          </div>
        </label>

        <div className="field">
          <span>공급 유형</span>
          <div className="chip-row">
            {(["", "private_sale", "public_sale"] as const).map((type) => (
              <button
                key={type}
                type="button"
                className={offeringType === type ? "filter-chip is-active" : "filter-chip"}
                onClick={() => setOfferingType(type)}
              >
                {type === "" ? "전체" : type === "private_sale" ? "민간분양" : "공공분양"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeFilters.length > 0 && (
        <div className="chip-row active-filters">
          {activeFilters.map((label) => (
            <span
              key={label}
              className="active-filter-chip"
            >
              {label}
            </span>
          ))}
          <button
            type="button"
            className="filter-chip"
            onClick={() => {
              setRegion("");
              setMaxPrice(0);
              setOfferingType("");
            }}
          >
            전체 초기화
          </button>
        </div>
      )}

      <section className="section-block">
        <div className="section-block__header">
          <h3>결과 {filteredItems.length}건</h3>
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
          >
            <option value="actionable">접수 가능순</option>
            <option value="schedule">일정 임박순</option>
            <option value="latest">최신 공고순</option>
          </select>
        </div>
        <div className="card-grid">
          {filteredItems.map((offering) => (
            <OfferingCard
              key={offering.id}
              offering={offering}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
