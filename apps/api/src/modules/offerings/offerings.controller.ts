import { type OfferingsFilter } from "@bunyang-flow/shared";
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager";
import { Controller, Get, Param, Query, UseInterceptors } from "@nestjs/common";

import { GetOfferingsQueryDto } from "./dto";
import { OfferingsService } from "./offerings.service";

@Controller("offerings")
export class OfferingsController {
  constructor(private readonly offeringsService: OfferingsService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(600) // 10분
  getOfferings(@Query() query: GetOfferingsQueryDto) {
    return this.offeringsService.list(this.toFilters(query));
  }

  @Get("map")
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(600)
  getOfferingsForMap(@Query() query: GetOfferingsQueryDto) {
    return this.offeringsService.listForMap(this.toFilters(query));
  }

  @Get(":id")
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1800) // 30분
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
      swLat: query.swLat,
      swLng: query.swLng,
      neLat: query.neLat,
      neLng: query.neLng,
    };
  }
}
