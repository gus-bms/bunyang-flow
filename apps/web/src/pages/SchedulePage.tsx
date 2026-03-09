import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { PageHeader } from "../components/common/PageHeader";
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
  const savedOfferingIds = usePreferenceStore((state) => state.savedOfferingIds);
  const alertedOfferingIds = usePreferenceStore((state) => state.alertedOfferingIds);
  const toggleAlert = usePreferenceStore((state) => state.toggleAlert);

  const { data } = useQuery({
    queryKey: ["schedule", savedOfferingIds],
    queryFn: () => getSchedule(savedOfferingIds),
  });

  const grouped = useMemo(() => {
    const items = data?.items ?? [];
    const map = new Map<string, typeof items>();

    for (const item of items) {
      const existing = map.get(item.offeringId) ?? [];
      existing.push(item);
      map.set(item.offeringId, existing);
    }

    return Array.from(map.entries()).map(([offeringId, events]) => ({
      offeringId,
      complexName: events[0]?.complexName ?? "",
      events,
    }));
  }, [data]);

  return (
    <div className="page-stack">
      <PageHeader
        title="일정 캘린더"
        description="관심 단지 기준으로 다가오는 모집공고, 접수, 발표, 계약 일정을 모아봅니다."
        action={
          <Link
            to="/alerts"
            className="secondary-link"
          >
            알림 설정
          </Link>
        }
      />

      {grouped.length === 0 && (
        <div className="panel">
          <p>관심 단지가 없습니다.</p>
          <Link
            to="/offerings"
            className="secondary-link"
          >
            분양 찾기에서 단지 저장하기
          </Link>
        </div>
      )}

      {grouped.map((group) => {
        const isAlerted = alertedOfferingIds.includes(group.offeringId);

        return (
          <section
            key={group.offeringId}
            className="panel schedule-group"
          >
            <div className="schedule-group__header">
              <Link
                to={`/offerings/${group.offeringId}`}
                className="comparison-col__name"
              >
                {group.complexName}
              </Link>
              <button
                type="button"
                className={isAlerted ? "toggle-switch toggle-switch--on" : "toggle-switch"}
                onClick={() => toggleAlert(group.offeringId)}
                title={isAlerted ? "알림 끄기" : "알림 켜기"}
              />
            </div>

            {group.events.map((event) => {
              const dday = getDDayLabel(event.date);
              return (
                <div
                  key={event.id}
                  className="schedule-event-row"
                >
                  <div className="schedule-event-row__info">
                    <strong>{event.label}</strong>
                    <span className="muted">{formatDate(event.date)}</span>
                  </div>
                  <span className={`d-day-badge ${dday.variant}`}>{dday.label}</span>
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
