import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { PageHeader } from "../components/common/PageHeader";
import { OfferingCard } from "../components/offerings/OfferingCard";
import { getOfferings } from "../lib/api";
import { usePreferenceStore } from "../store/preferences";

type SortKey = "schedule" | "saved_recent";

export function SavedPage() {
  const savedOfferingIds = usePreferenceStore((state) => state.savedOfferingIds);
  const toggleSavedOffering = usePreferenceStore((state) => state.toggleSavedOffering);
  const [sortKey, setSortKey] = useState<SortKey>("schedule");

  const { data } = useQuery({
    queryKey: ["offerings", "saved"],
    queryFn: () => getOfferings(),
  });

  const items = useMemo(() => {
    const base = (data?.items ?? []).filter((offering) => savedOfferingIds.includes(offering.id));

    if (sortKey === "saved_recent") {
      return [...base].sort(
        (a, b) => savedOfferingIds.indexOf(a.id) - savedOfferingIds.indexOf(b.id),
      );
    }

    // 일정 임박순: 다음 일정 날짜 오름차순
    return [...base].sort((a, b) => a.nextScheduleAt.localeCompare(b.nextScheduleAt));
  }, [data, savedOfferingIds, sortKey]);

  return (
    <div className="page-stack">
      <PageHeader
        title="관심 단지"
        description="즐겨찾기보다 일정 관리 대상에 가깝게 보이도록 구성했습니다."
        action={
          items.length > 0 ? (
            <Link
              to="/compare"
              className="secondary-link"
            >
              비교함 보기
            </Link>
          ) : undefined
        }
      />

      {items.length > 0 && (
        <div className="filter-row">
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
          >
            <option value="schedule">일정 임박순</option>
            <option value="saved_recent">저장 최신순</option>
          </select>
        </div>
      )}

      <section className="card-grid">
        {items.length ? (
          items.map((offering) => (
            <div
              key={offering.id}
              className="saved-card-wrap"
            >
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
        ) : (
          <div className="panel">
            <p>저장한 단지가 없습니다.</p>
            <Link
              to="/offerings"
              className="secondary-link"
            >
              분양 찾기로 이동
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
