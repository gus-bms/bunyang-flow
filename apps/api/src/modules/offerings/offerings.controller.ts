import { type OfferingsFilter } from "@bunyang-flow/shared";
import { Controller, Get, Param, Query } from "@nestjs/common";

import { GetOfferingsQueryDto } from "./dto";
import { OfferingsService } from "./offerings.service";

@Controller("offerings")
export class OfferingsController {
  constructor(private readonly offeringsService: OfferingsService) {}

  @Get()
  getOfferings(@Query() query: GetOfferingsQueryDto) {
    return this.offeringsService.list(this.toFilters(query));
  }

  @Get("map")
  getOfferingsForMap(@Query() query: GetOfferingsQueryDto) {
    return this.offeringsService.listForMap(this.toFilters(query));
  }

  @Get(":id")
  getOffering(@Param("id") id: string) {
    return this.offeringsService.detail(id);
  }

  @Get(":id/competition")
  getCompetition(@Param("id") id: string) {
    return this.offeringsService.competition(id);
  }

  @Get(":id/regulation")
  getRegulation(@Param("id") id: string) {
    return this.offeringsService.regulation(id);
  }

  private toFilters(query: GetOfferingsQueryDto): OfferingsFilter {
    return {
      stages: query.stages,
      region: query.region,
      offeringType: query.offeringType,
      maxPrice: query.maxPrice,
      minArea: query.minArea,
      specialSupplyType: query.specialSupplyType as OfferingsFilter["specialSupplyType"],
    };
  }
}
