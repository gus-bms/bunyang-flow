import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { getSchedule } from "../lib/api";
import { formatDate } from "../lib/format";
import { usePreferenceStore } from "../store/preferences";

function getDDayLabel(dateStr: string): { label: string; variant: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return { label: "D-Day", variant: "d-day-badge--today" };
  if (diff > 0) return { label: `D-${diff}`, variant: "" };
  return { label: `D+${Math.abs(diff)}`, variant: "d-day-badge--past" };
}

export function SchedulePage() {
  const savedOfferingIds = usePreferenceStore((s) => s.savedOfferingIds);
  const alertedOfferingIds = usePreferenceStore((s) => s.alertedOfferingIds);
  const toggleAlert = usePreferenceStore((s) => s.toggleAlert);

  const { data } = useQuery({
    queryKey: ["schedule", savedOfferingIds],
    queryFn: () => getSchedule(savedOfferingIds),
  });

  const grouped = useMemo(() => {
    const items = data?.items ?? [];
    const map = new Map<string, typeof items>();
    for (const item of items) {
      const arr = map.get(item.offeringId) ?? [];
      arr.push(item);
      map.set(item.offeringId, arr);
    }
    return Array.from(map.entries()).map(([offeringId, events]) => ({
      offeringId,
      complexName: events[0]?.complexName ?? "",
      events,
    }));
  }, [data]);

  return (
    <div className="page-stack">
      <div style={{ padding: "16px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>일정</h2>
        <Link to="/alerts" style={{ fontSize: 15, color: "var(--c-blue)", fontWeight: 500 }}>알림 설정</Link>
      </div>

      {grouped.length === 0 && (
        <div style={{ margin: "12px 16px 0", background: "var(--c-surface)", borderRadius: 14, padding: "48px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 15, color: "var(--c-label3)", margin: "0 0 12px" }}>관심 단지가 없습니다</p>
          <Link to="/offerings" style={{ fontSize: 15, color: "var(--c-blue)", fontWeight: 500 }}>분양 찾기에서 추가</Link>
        </div>
      )}

      {grouped.map((group) => {
        const isAlerted = alertedOfferingIds.includes(group.offeringId);
        return (
          <div key={group.offeringId} style={{ marginTop: 8 }}>
            {/* 단지 헤더 */}
            <div style={{ padding: "12px 16px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Link to={`/offerings/${group.offeringId}`} style={{ fontSize: 17, fontWeight: 600, color: "var(--c-label)" }}>
                {group.complexName}
              </Link>
              <button
                type="button"
                className={isAlerted ? "toggle-switch toggle-switch--on" : "toggle-switch"}
                onClick={() => toggleAlert(group.offeringId)}
                title={isAlerted ? "알림 끄기" : "알림 켜기"}
              />
            </div>

            {/* 이벤트 목록 */}
            <div className="inset-group">
              {group.events.map((event) => {
                const dday = getDDayLabel(event.date);
                return (
                  <div key={event.id} className="inset-group__row">
                    <div style={{ display: "grid", gap: 2 }}>
                      <span style={{ fontSize: 15, fontWeight: 500 }}>{event.label}</span>
                      <span style={{ fontSize: 13, color: "var(--c-label3)" }}>{formatDate(event.date)}</span>
                    </div>
                    <span className={`d-day-badge ${dday.variant}`}>{dday.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div style={{ height: 16 }} />
    </div>
  );
}
