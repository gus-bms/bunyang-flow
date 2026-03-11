import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import type { RawOffering } from "../adapters/publicdata.adapter";

export interface ChangedOffering {
  offerNo: string;
  complexName: string;
  changedFields: string[];
}

/**
 * DB에 저장된 기존 데이터와 새로 수집한 데이터를 비교해 변경 항목을 감지한다.
 * 변경 감지 결과는 추후 알림 트리거에 사용된다.
 */
@Injectable()
export class ChangeDetector {
  constructor(private readonly prisma: PrismaService) {}

  async detect(incoming: RawOffering[]): Promise<ChangedOffering[]> {
    const changed: ChangedOffering[] = [];

    for (const item of incoming) {
      const existing = await this.prisma.housingOffering.findUnique({
        where: { id: item.offerNo },
        select: { complexName: true, totalHouseholds: true, moveInPlannedAt: true },
      });

      if (!existing) continue;

      const changedFields: string[] = [];
      if (existing.totalHouseholds !== item.totalHouseholds) changedFields.push("totalHouseholds");
      if (existing.moveInPlannedAt !== item.moveInDate) changedFields.push("moveInPlannedAt");

      if (changedFields.length > 0) {
        changed.push({ offerNo: item.offerNo, complexName: item.complexName, changedFields });
      }
    }

    return changed;
  }
}
