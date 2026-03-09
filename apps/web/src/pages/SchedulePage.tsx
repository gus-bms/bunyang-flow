import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "../components/common/PageHeader";
import { getSchedule } from "../lib/api";
import { formatDate } from "../lib/format";
import { usePreferenceStore } from "../store/preferences";

export function SchedulePage() {
  const savedOfferingIds = usePreferenceStore((state) => state.savedOfferingIds);
  const { data } = useQuery({
    queryKey: ["schedule", savedOfferingIds],
    queryFn: () => getSchedule(savedOfferingIds),
  });

  return (
    <div className="page-stack">
      <PageHeader
        title="일정 캘린더"
        description="관심 단지 기준으로 다가오는 모집공고, 접수, 발표, 계약 일정을 모아봅니다."
      />

      <section className="panel list-stack">
        {(data?.items ?? []).map((item) => (
          <div
            key={item.id}
            className="timeline__item"
          >
            <strong>{item.complexName}</strong>
            <span>
              {item.label} / {formatDate(item.date)}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
