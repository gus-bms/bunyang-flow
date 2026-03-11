import { useCallback, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import type { OfferingStage } from "@bunyang-flow/shared";

import { KakaoMap, type MapItem } from "../components/map/KakaoMap";
import { MapInfoCard } from "../components/map/MapInfoCard";
import { StageBadge } from "../components/offerings/StageBadge";
import { getOfferingsForMap, type MapOfferingsParams } from "../lib/api";
import { formatPrice } from "../lib/format";

const STAGE_FILTERS: Array<{ label: string; stage: OfferingStage }> = [
  { label: "특별공급", stage: "special_supply_open" },
  { label: "1순위", stage: "priority_1_open" },
  { label: "2순위", stage: "priority_2_open" },
  { label: "공고", stage: "announcement_open" },
  { label: "당첨", stage: "winner_announced" },
  { label: "계약", stage: "contract_open" },
];

export function OfferingsMapPage() {
  const [selectedStages, setSelectedStages] = useState<OfferingStage[]>([]);
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
  const [queryParams, setQueryParams] = useState<MapOfferingsParams>({});
  const [pendingBounds, setPendingBounds] = useState<MapOfferingsParams | null>(null);

  const hasKakaoKey = Boolean(import.meta.env.VITE_KAKAO_MAP_KEY);

  const { data, refetch } = useQuery({
    queryKey: ["offerings", "map", queryParams],
    queryFn: () => getOfferingsForMap(queryParams),
    staleTime: 5 * 60 * 1000,
  });

  const items = data?.items ?? [];

  const handleBoundsChange = useCallback(
    (bounds: { swLat: number; swLng: number; neLat: number; neLng: number }) => {
      setPendingBounds({ ...bounds, stages: selectedStages.length ? selectedStages : undefined });
    },
    [selectedStages],
  );

  const handleResearch = () => {
    if (pendingBounds) {
      setQueryParams(pendingBounds);
      setPendingBounds(null);
    }
  };

  const toggleStage = (stage: OfferingStage) => {
    setSelectedStages((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage],
    );
  };

  // Fallback: no Kakao key — show prototype grid map
  if (!hasKakaoKey) {
    return (
      <div className="page-stack">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>지도 뷰</h2>
          <Link className="secondary-link" to="/offerings">
            리스트 보기
          </Link>
        </div>

        <div
          className="panel"
          style={{ textAlign: "center", padding: "40px 24px", color: "#637089" }}
        >
          <p style={{ fontWeight: 600, marginBottom: "8px" }}>카카오 지도 API 키가 필요합니다</p>
          <p style={{ fontSize: "13px" }}>
            <code>.env</code>에 <code>VITE_KAKAO_MAP_KEY</code>를 설정하면 실제 지도가 표시됩니다.
          </p>
        </div>

        <div className="map-board__list">
          {items.map((item) => (
            <article key={item.id} className="map-list-card">
              <div className="offering-card__topline">
                <StageBadge stage={item.currentStage} />
              </div>
              <h3>{item.complexName}</h3>
              {item.minSalePrice > 0 && (
                <p className="muted">{formatPrice(item.minSalePrice)}~</p>
              )}
              <Link className="primary-link" to={`/offerings/${item.id}`}>
                상세 이동
              </Link>
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        overflow: "hidden",
      }}
    >
      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "10px 12px",
          alignItems: "center",
          flexWrap: "wrap",
          background: "rgba(255,255,255,0.92)",
          borderBottom: "1px solid rgba(23,32,51,0.06)",
          zIndex: 10,
        }}
      >
        {STAGE_FILTERS.map(({ label, stage }) => (
          <button
            key={stage}
            className={`filter-chip${selectedStages.includes(stage) ? " is-active" : ""}`}
            onClick={() => toggleStage(stage)}
          >
            {label}
          </button>
        ))}
        <Link className="secondary-link" to="/offerings" style={{ marginLeft: "auto" }}>
          리스트
        </Link>
      </div>

      {/* Map */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <KakaoMap
          items={items}
          selectedId={selectedItem?.id}
          onBoundsChange={handleBoundsChange}
          onSelect={setSelectedItem}
        />

        {/* 이 지역 재검색 button */}
        {pendingBounds && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
            }}
          >
            <button
              className="secondary-link"
              onClick={handleResearch}
              style={{ whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
            >
              이 지역 재검색
            </button>
          </div>
        )}

        {/* Info card on marker click */}
        {selectedItem && (
          <MapInfoCard item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </div>

      {/* Bottom list panel */}
      <div
        style={{
          background: "rgba(255,255,255,0.96)",
          borderTop: "1px solid rgba(23,32,51,0.08)",
          padding: "12px",
          maxHeight: "200px",
          overflowY: "auto",
          display: "flex",
          gap: "10px",
          overflowX: "auto",
        }}
      >
        {items.length === 0 ? (
          <p style={{ color: "#637089", fontSize: "13px", margin: "auto" }}>
            이 지역에 분양 공고가 없습니다
          </p>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              to={`/offerings/${item.id}`}
              style={{
                flexShrink: 0,
                padding: "12px 16px",
                borderRadius: "20px",
                background: "#f8f4ef",
                display: "grid",
                gap: "4px",
                minWidth: "160px",
                textDecoration: "none",
                color: "inherit",
              }}
              onClick={() => setSelectedItem(item)}
            >
              <StageBadge stage={item.currentStage} />
              <strong style={{ fontSize: "13px" }}>{item.complexName}</strong>
              {item.minSalePrice > 0 && (
                <span style={{ fontSize: "12px", color: "#637089" }}>
                  {formatPrice(item.minSalePrice)}~
                </span>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
