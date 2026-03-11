import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { OfferingCard } from "../components/offerings/OfferingCard";
import { getOfferings } from "../lib/api";
import { usePreferenceStore } from "../store/preferences";

type SortKey = "schedule" | "saved_recent";

export function SavedPage() {
  const savedOfferingIds = usePreferenceStore((s) => s.savedOfferingIds);
  const toggleSavedOffering = usePreferenceStore((s) => s.toggleSavedOffering);
  const [sortKey, setSortKey] = useState<SortKey>("schedule");

  const { data } = useQuery({
    queryKey: ["offerings", "saved"],
    queryFn: () => getOfferings(),
  });

  const items = useMemo(() => {
    const base = (data?.items ?? []).filter((o) => savedOfferingIds.includes(o.id));
    if (sortKey === "saved_recent") return [...base].sort((a, b) => savedOfferingIds.indexOf(a.id) - savedOfferingIds.indexOf(b.id));
    return [...base].sort((a, b) => a.nextScheduleAt.localeCompare(b.nextScheduleAt));
  }, [data, savedOfferingIds, sortKey]);

  return (
    <div className="page-stack">
      <div style={{ padding: "16px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>관심 단지</h2>
        {items.length > 0 && (
          <Link to="/compare" style={{ fontSize: 15, color: "var(--c-blue)", fontWeight: 500 }}>비교함</Link>
        )}
      </div>

      {items.length > 0 && (
        <div style={{ padding: "8px 16px", display: "flex", justifyContent: "flex-end" }}>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            style={{ border: "1px solid var(--c-sep)", borderRadius: 8, padding: "6px 10px", background: "var(--c-surface)", fontSize: 13 }}
          >
            <option value="schedule">일정 임박순</option>
            <option value="saved_recent">저장 최신순</option>
          </select>
        </div>
      )}

      <div className="card-grid">
        {items.length === 0 ? (
          <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: "48px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 15, color: "var(--c-label3)", margin: "0 0 12px" }}>저장한 단지가 없습니다</p>
            <Link to="/offerings" style={{ fontSize: 15, color: "var(--c-blue)", fontWeight: 500 }}>분양 찾기</Link>
          </div>
        ) : (
          items.map((offering) => (
            <div key={offering.id} style={{ display: "grid", gap: 6 }}>
              <OfferingCard offering={offering} />
              <button
                type="button"
                className="unsave-button"
                onClick={() => toggleSavedOffering(offering.id)}
              >
                저장 해제
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
