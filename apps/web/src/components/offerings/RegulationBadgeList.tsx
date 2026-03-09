import type { RegulationInfo } from "@bunyang-flow/shared";

import { buildRegulationBadges } from "../../lib/format";

export function RegulationBadgeList({ regulation }: { regulation: RegulationInfo }) {
  return (
    <div className="badge-list">
      {buildRegulationBadges(regulation).map((badge) => (
        <span
          key={badge}
          className="soft-badge"
        >
          {badge}
        </span>
      ))}
    </div>
  );
}
