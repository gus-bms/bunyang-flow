import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { PageHeader } from "../components/common/PageHeader";
import { StageBadge } from "../components/offerings/StageBadge";
import { getOfferings } from "../lib/api";
import { formatDate } from "../lib/format";
import { usePreferenceStore } from "../store/preferences";

export function AlertsPage() {
  const savedOfferingIds = usePreferenceStore((state) => state.savedOfferingIds);
  const alertedOfferingIds = usePreferenceStore((state) => state.alertedOfferingIds);
  const toggleAlert = usePreferenceStore((state) => state.toggleAlert);

  const { data } = useQuery({
    queryKey: ["offerings", "alerts"],
    queryFn: () => getOfferings(),
    enabled: savedOfferingIds.length > 0,
  });

  const savedOfferings = (data?.items ?? []).filter((offering) =>
    savedOfferingIds.includes(offering.id),
  );

  if (savedOfferingIds.length === 0) {
    return (
      <div className="page-stack">
        <PageHeader
          title="알림 설정"
          description="관심 단지의 주요 일정 알림을 관리합니다."
        />
        <div className="panel">
          <p>저장한 단지가 없습니다.</p>
          <Link
            to="/offerings"
            className="secondary-link"
          >
            분양 찾기에서 단지 저장하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="알림 설정"
        description="관심 단지의 주요 일정 알림을 관리합니다."
      />

      <section className="panel">
        <p className="eyebrow">알림 안내</p>
        <p className="muted">
          알림을 켜면 해당 단지의 접수 시작, 당첨자 발표, 계약 시작 일정을 앱 내에서
          확인할 수 있습니다. 실제 푸시 알림은 로그인 기능 추가 이후 지원될 예정입니다.
        </p>
      </section>

      <section className="panel form-stack">
        <p className="eyebrow">관심 단지별 알림</p>
        {savedOfferings.map((offering) => {
          const isAlerted = alertedOfferingIds.includes(offering.id);

          return (
            <div
              key={offering.id}
              className="alert-row"
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <StageBadge stage={offering.currentStage} />
                </div>
                <Link
                  to={`/offerings/${offering.id}`}
                  className="comparison-col__name"
                >
                  {offering.complexName}
                </Link>
                <p className="muted" style={{ margin: "2px 0 0" }}>
                  다음 일정: {offering.nextScheduleLabel} ({formatDate(offering.nextScheduleAt)})
                </p>
              </div>
              <button
                type="button"
                className={isAlerted ? "toggle-switch toggle-switch--on" : "toggle-switch"}
                onClick={() => toggleAlert(offering.id)}
                title={isAlerted ? "알림 끄기" : "알림 켜기"}
              />
            </div>
          );
        })}
      </section>

      <div>
        <Link
          to="/schedule"
          className="secondary-link"
        >
          ← 일정 캘린더로 돌아가기
        </Link>
      </div>
    </div>
  );
}
