import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "../components/common/PageHeader";
import { OfferingCard } from "../components/offerings/OfferingCard";
import { getOfferings } from "../lib/api";
import { usePreferenceStore } from "../store/preferences";

export function SavedPage() {
  const savedOfferingIds = usePreferenceStore((state) => state.savedOfferingIds);
  const { data } = useQuery({
    queryKey: ["offerings", "saved"],
    queryFn: () => getOfferings(),
  });

  const items = (data?.items ?? []).filter((offering) => savedOfferingIds.includes(offering.id));

  return (
    <div className="page-stack">
      <PageHeader
        title="관심 단지"
        description="즐겨찾기보다 일정 관리 대상에 가깝게 보이도록 구성했습니다."
      />

      <section className="card-grid">
        {items.length ? (
          items.map((offering) => (
            <OfferingCard
              key={offering.id}
              offering={offering}
            />
          ))
        ) : (
          <div className="panel">저장한 단지가 없습니다.</div>
        )}
      </section>
    </div>
  );
}
