import type { OfferingStage } from "@bunyang-flow/shared";

import { getStageDisplay, getStageTone } from "../../lib/format";

export function StageBadge({ stage }: { stage: OfferingStage }) {
  return (
    <span className={`stage-badge stage-badge--${getStageTone(stage)}`}>
      {getStageDisplay(stage)}
    </span>
  );
}
