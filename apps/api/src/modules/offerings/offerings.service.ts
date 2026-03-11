import { type OfferingsFilter } from "@bunyang-flow/shared";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";

function serializeBigInt<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) =>
      typeof value === "bigint" ? Number(value) : value,
    ),
  ) as T;
}

@Injectable()
export class OfferingsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(filters: OfferingsFilter): Prisma.HousingOfferingWhereInput {
    const where: Prisma.HousingOfferingWhereInput = {};

    if (filters.stages?.length) {
      where.currentStage = { in: filters.stages as any };
    }

    if (filters.region) {
      where.OR = [
        { regionLabel: { contains: filters.region } },
        { addressFull: { contains: filters.region } },
      ];
    }

    if (filters.offeringType) {
      where.offeringType = filters.offeringType as any;
    }

    if (filters.maxPrice) {
      where.minSalePrice = { lte: BigInt(filters.maxPrice) };
    }

    if (filters.minArea) {
      where.housingTypes = {
        some: { exclusiveAreaM2: { gte: filters.minArea } },
      };
    }

    if (filters.specialSupplyType) {
      where.supplyRules = {
        some: { specialSupplyType: filters.specialSupplyType as any },
      };
    }

    if (
      filters.swLat !== undefined &&
      filters.swLng !== undefined &&
      filters.neLat !== undefined &&
      filters.neLng !== undefined
    ) {
      where.latitude = { gte: filters.swLat, lte: filters.neLat };
      where.longitude = { gte: filters.swLng, lte: filters.neLng };
    }

    return where;
  }

  async list(filters: OfferingsFilter) {
    const where = this.buildWhere(filters);
    const items = await this.prisma.housingOffering.findMany({
      where,
      include: {
        housingTypes: true,
        scheduleEvents: true,
        supplyRules: true,
        regulationInfo: true,
        competitionRates: true,
      },
      orderBy: { announcementDate: "desc" },
    });

    return serializeBigInt({ total: items.length, items });
  }

  async listForMap(filters: OfferingsFilter) {
    const where = this.buildWhere(filters);
    const rows = await this.prisma.housingOffering.findMany({
      where,
      select: {
        id: true,
        complexName: true,
        latitude: true,
        longitude: true,
        currentStage: true,
        minSalePrice: true,
        nextScheduleLabel: true,
        nextScheduleAt: true,
      },
      orderBy: { announcementDate: "desc" },
    });

    const items = rows.map((r) => ({
      ...r,
      minSalePrice: Number(r.minSalePrice),
    }));

    return { total: items.length, items };
  }

  async detail(id: string) {
    const item = await this.prisma.housingOffering.findUnique({
      where: { id },
      include: {
        housingTypes: true,
        scheduleEvents: true,
        supplyRules: true,
        regulationInfo: true,
        competitionRates: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Offering ${id} not found`);
    }

    return serializeBigInt(item);
  }

  async competition(id: string) {
    const LIVE_STAGES = new Set([
      "special_supply_open",
      "priority_1_open",
      "priority_2_open",
    ]);

    const item = await this.prisma.housingOffering.findUnique({
      where: { id },
      select: {
        currentStage: true,
        dataCheckedAt: true,
        competitionRates: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Offering ${id} not found`);
    }

    return {
      isLive: LIVE_STAGES.has(item.currentStage),
      lastUpdatedAt: item.dataCheckedAt,
      rates: item.competitionRates,
    };
  }

  async regulation(id: string) {
    const item = await this.prisma.housingOffering.findUnique({
      where: { id },
      select: { regulationInfo: true },
    });

    if (!item) {
      throw new NotFoundException(`Offering ${id} not found`);
    }

    return item.regulationInfo;
  }
}
