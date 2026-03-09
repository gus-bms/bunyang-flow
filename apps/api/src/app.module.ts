import { Module } from "@nestjs/common";

import { EligibilityModule } from "./modules/eligibility/eligibility.module";
import { OfferingsModule } from "./modules/offerings/offerings.module";
import { ScheduleModule } from "./modules/schedule/schedule.module";
import { ScoreModule } from "./modules/score/score.module";

@Module({
  imports: [OfferingsModule, ScheduleModule, EligibilityModule, ScoreModule],
})
export class AppModule {}
