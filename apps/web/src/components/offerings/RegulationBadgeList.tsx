import type { RegulationInfo } from "@bunyang-flow/shared";

import { buildRegulationBadges } from "../../lib/format";

export function RegulationBadgeList({ regulation }: { regulation: RegulationInfo }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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
