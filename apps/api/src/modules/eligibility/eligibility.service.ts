import { checkEligibility, findOffering } from "@bunyang-flow/shared";
import { Injectable, NotFoundException } from "@nestjs/common";

import { EligibilityInputDto } from "./dto";

@Injectable()
export class EligibilityService {
  check(input: EligibilityInputDto) {
    const offering = input.offeringId ? findOffering(input.offeringId) : undefined;

    if (input.offeringId && !offering) {
      throw new NotFoundException(`Offering ${input.offeringId} not found`);
    }

    return checkEligibility(
      {
        residenceRegion1: input.residenceRegion1,
        residenceRegion2: input.residenceRegion2,
        isHomeless: input.isHomeless,
        isHeadOfHousehold: input.isHeadOfHousehold,
        hasSubscriptionAccount: input.hasSubscriptionAccount,
        subscriptionPeriodMonths: input.subscriptionPeriodMonths,
        specialSupplyFlags: input.specialSupplyFlags,
        budgetMax: input.budgetMax,
      },
      offering,
    );
  }
}
