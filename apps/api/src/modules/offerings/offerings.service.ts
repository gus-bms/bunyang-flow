import {
  findOffering,
  listOfferings,
  type OfferingsFilter,
} from "@bunyang-flow/shared";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class OfferingsService {
  list(filters: OfferingsFilter) {
    const items = listOfferings(filters);

    return {
      total: items.length,
      items,
    };
  }

  listForMap(filters: OfferingsFilter) {
    const items = listOfferings(filters).map((offering) => ({
      id: offering.id,
      complexName: offering.complexName,
      latitude: offering.latitude,
      longitude: offering.longitude,
      currentStage: offering.currentStage,
      minSalePrice: offering.minSalePrice,
      nextScheduleLabel: offering.nextScheduleLabel,
      nextScheduleAt: offering.nextScheduleAt,
    }));

    return {
      total: items.length,
      items,
    };
  }

  detail(id: string) {
    const item = findOffering(id);

    if (!item) {
      throw new NotFoundException(`Offering ${id} not found`);
    }

    return item;
  }

  competition(id: string) {
    return this.detail(id).competitionRates;
  }

  regulation(id: string) {
    return this.detail(id).regulationInfo;
  }
}
