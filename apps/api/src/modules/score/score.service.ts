import { calculateScore } from "@bunyang-flow/shared";
import { Injectable } from "@nestjs/common";

import { ScoreInputDto } from "./dto";

@Injectable()
export class ScoreService {
  calculate(input: ScoreInputDto) {
    return calculateScore(input);
  }

  getMyScore() {
    return calculateScore({
      homelessPeriodYears: 12,
      dependentCount: 3,
      subscriptionPeriodYears: 10,
    });
  }
}
