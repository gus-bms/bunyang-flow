import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { PageHeader } from "../components/common/PageHeader";
import { StageBadge } from "../components/offerings/StageBadge";
import { getOfferings } from "../lib/api";
import { formatPrice } from "../lib/format";

function getMarkerPosition(index: number) {
  const positions = [
    { left: "22%", top: "34%" },
    { left: "58%", top: "28%" },
    { left: "40%", top: "58%" },
    { left: "70%", top: "62%" },
  ];

  return positions[index % positions.length];
}

export function OfferingsMapPage() {
  const { data } = useQuery({
    queryKey: ["offerings", "map"],
    queryFn: () => getOfferings(),
  });

  const items = data?.items ?? [];

  return (
    <div className="page-stack">
      <PageHeader
        title="지도 기반 분양 탐색"
        description="초기 버전에서는 좌표 기반 프로토타입 맵으로 마커와 하단 패널 흐름을 먼저 검증합니다."
        action={
          <Link
            className="secondary-link"
            to="/offerings"
          >
            리스트 보기
          </Link>
        }
      />

      <section className="map-board">
        <div className="map-board__canvas">
          {items.map((offering, index) => {
            const position = getMarkerPosition(index);
            return (
              <Link
                key={offering.id}
                to={`/offerings/${offering.id}`}
                className="map-marker"
                style={position}
              >
                <span>{offering.complexName}</span>
              </Link>
            );
          })}
        </div>
        <div className="map-board__list">
          {items.map((offering) => (
            <article
              key={offering.id}
              className="map-list-card"
            >
              <div className="offering-card__topline">
                <StageBadge stage={offering.currentStage} />
                <span className="muted">{offering.regionLabel}</span>
              </div>
              <h3>{offering.complexName}</h3>
              <p className="muted">
                {formatPrice(offering.minSalePrice)} - {formatPrice(offering.maxSalePrice)}
              </p>
              <Link
                className="primary-link"
                to={`/offerings/${offering.id}`}
              >
                상세 이동
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
