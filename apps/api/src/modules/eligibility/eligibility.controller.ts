import { Body, Controller, Post } from "@nestjs/common";

import { EligibilityInputDto } from "./dto";
import { EligibilityService } from "./eligibility.service";

@Controller("eligibility")
export class EligibilityController {
  constructor(private readonly eligibilityService: EligibilityService) {}

  @Post("check")
  check(@Body() input: EligibilityInputDto) {
    return this.eligibilityService.check(input);
  }
}
