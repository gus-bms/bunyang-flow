import { buildScheduleFeed } from "@bunyang-flow/shared";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ScheduleService {
  list(offeringIds?: string[]) {
    return {
      items: buildScheduleFeed(offeringIds),
    };
  }
}
