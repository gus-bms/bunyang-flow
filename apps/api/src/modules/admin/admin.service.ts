import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CollectorService } from "../collector/collector.service";
import type { Prisma } from "@prisma/client";

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly collector: CollectorService,
  ) {}

  async createOffering(data: Prisma.HousingOfferingCreateInput) {
    return this.prisma.housingOffering.create({ data });
  }

  async updateOffering(id: string, data: Prisma.HousingOfferingUpdateInput) {
    const existing = await this.prisma.housingOffering.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Offering ${id} not found`);
    return this.prisma.housingOffering.update({ where: { id }, data });
  }

  async triggerCollection() {
    await this.collector.runCollection("admin:manual");
    return { triggered: true };
  }

  async reseed() {
    // 개발용: seed.ts 로직을 다시 실행하는 대신 collector 파이프라인을 트리거
    // 실제 환경에서는 collector를 통해 데이터를 갱신한다
    return this.triggerCollection();
  }
}
