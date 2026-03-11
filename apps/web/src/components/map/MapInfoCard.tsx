import { Link } from "react-router-dom";
import type { MapItem } from "./KakaoMap";
import { StageBadge } from "../offerings/StageBadge";
import { formatPrice } from "../../lib/format";

interface Props {
  item: MapItem;
  onClose: () => void;
}

export function MapInfoCard({ item, onClose }: Props) {
  const hasNextSchedule = item.nextScheduleLabel && item.nextScheduleAt;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 96,
        left: 12,
        right: 12,
        zIndex: 20,
        borderRadius: "var(--r-card)",
        padding: 16,
        background: "var(--c-surface)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "grid", gap: 6 }}>
          <StageBadge stage={item.currentStage} />
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, letterSpacing: "-0.3px" }}>{item.complexName}</h3>
        </div>
        <button
          onClick={onClose}
          type="button"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--c-label3)", fontSize: 18, lineHeight: 1 }}
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {item.minSalePrice > 0 && (
          <span className="price-chip">{formatPrice(item.minSalePrice)}~</span>
        )}
        {hasNextSchedule && (
          <span style={{ fontSize: 13, color: "var(--c-label3)" }}>
            {item.nextScheduleLabel}: {item.nextScheduleAt}
          </span>
        )}
      </div>

      <Link
        to={`/offerings/${item.id}`}
        className="primary-button"
        style={{ textAlign: "center", borderRadius: 12, justifyContent: "center" }}
      >
        상세 보기
      </Link>
    </div>
  );
}
