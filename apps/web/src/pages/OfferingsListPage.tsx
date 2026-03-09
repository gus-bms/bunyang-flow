import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { offeringStages } from "@bunyang-flow/shared";
import { Link } from "react-router-dom";

import { PageHeader } from "../components/common/PageHeader";
import { OfferingCard } from "../components/offerings/OfferingCard";
import { getOfferings } from "../lib/api";
import { getStageDisplay } from "../lib/format";

export function OfferingsListPage() {
  const [search, setSearch] = useState("");
  const [selectedStages, setSelectedStages] = useState<string[]>([
    "special_supply_open",
    "announcement_open",
  ]);
  const [region, setRegion] = useState("서울");
  const deferredSearch = useDeferredValue(search);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedStages.length) {
      params.set("stages", selectedStages.join(","));
    }
    if (region) {
      params.set("region", region);
    }
    return params;
  }, [region, selectedStages]);

  const { data } = useQuery({
    queryKey: ["offerings", queryString.toString()],
    queryFn: () => getOfferings(queryString),
  });

  const filteredItems = (data?.items ?? []).filter((item) =>
    `${item.complexName} ${item.regionLabel}`.toLowerCase().includes(deferredSearch.toLowerCase()),
  );

  function toggleStage(stage: string) {
    setSelectedStages((current) =>
      current.includes(stage)
        ? current.filter((item) => item !== stage)
        : [...current, stage],
    );
  }

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
      </section>

      <section className="section-block">
        <div className="section-block__header">
          <h3>결과 {filteredItems.length}건</h3>
          <span>접수 가능 순 중심</span>
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
