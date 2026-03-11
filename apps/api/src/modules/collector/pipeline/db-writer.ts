import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import type { RawOffering } from "../adapters/publicdata.adapter";

export interface WriteResult {
  upserted: number;
  errors: number;
}

type OfferingStage =
  | "planned"
  | "announcement_open"
  | "special_supply_open"
  | "priority_1_open"
  | "priority_2_open"
  | "winner_announced"
  | "contract_open"
  | "move_in_pending"
  | "closed";

/** 오늘 날짜(YYYY-MM-DD)와 각 일정 날짜를 비교해 현재 단계를 반환 */
function computeStage(item: RawOffering, today: string): OfferingStage {
  const d = today;
  if (item.contractEndDate && d > item.contractEndDate) return "closed";
  if (item.contractStartDate && d >= item.contractStartDate) return "contract_open";
  if (item.winnerAnnouncementDate && d >= item.winnerAnnouncementDate) return "winner_announced";
  if (item.priority2StartDate && d >= item.priority2StartDate) return "priority_2_open";
  if (item.priority1StartDate && d >= item.priority1StartDate) return "priority_1_open";
  if (item.specialSupplyStartDate && d >= item.specialSupplyStartDate) return "special_supply_open";
  if (item.announcementDate && d >= item.announcementDate) return "announcement_open";
  return "planned";
}

/** 다음 예정 일정 라벨과 날짜를 반환 */
function computeNextSchedule(
  item: RawOffering,
  today: string,
): { label: string; at: string } {
  const candidates = [
    { label: "특별공급", at: item.specialSupplyStartDate },
    { label: "1순위 청약", at: item.priority1StartDate },
    { label: "2순위 청약", at: item.priority2StartDate },
    { label: "당첨자 발표", at: item.winnerAnnouncementDate },
    { label: "계약 시작", at: item.contractStartDate },
    { label: "입주 예정", at: item.moveInDate },
  ]
    .filter((e) => e.at && e.at > today)
    .sort((a, b) => a.at.localeCompare(b.at));

  return candidates[0] ?? { label: "", at: "" };
}

/** 스케줄 이벤트 목록 생성 */
function buildScheduleEvents(item: RawOffering, today: string) {
  type EventType =
    | "announcement"
    | "special_supply"
    | "priority_1"
    | "priority_2"
    | "winner_announcement"
    | "contract"
    | "move_in";
  type EventStatus = "upcoming" | "ongoing" | "completed";

  const status = (start: string, end?: string): EventStatus => {
    if (!start) return "upcoming";
    if (end && today > end) return "completed";
    if (today >= start) return "ongoing";
    return "upcoming";
  };

  const events: Array<{
    eventType: EventType;
    startsAt: string;
    endsAt: string | null;
    displayLabel: string;
    status: EventStatus;
  }> = [];

  if (item.announcementDate) {
    events.push({
      eventType: "announcement",
      startsAt: item.announcementDate,
      endsAt: null,
      displayLabel: "모집공고",
      status: today >= item.announcementDate ? "completed" : "upcoming",
    });
  }
  if (item.specialSupplyStartDate) {
    events.push({
      eventType: "special_supply",
      startsAt: item.specialSupplyStartDate,
      endsAt: item.specialSupplyEndDate || null,
      displayLabel: "특별공급 청약",
      status: status(item.specialSupplyStartDate, item.specialSupplyEndDate),
    });
  }
  if (item.priority1StartDate) {
    events.push({
      eventType: "priority_1",
      startsAt: item.priority1StartDate,
      endsAt: item.priority1EndDate || null,
      displayLabel: "1순위 청약",
      status: status(item.priority1StartDate, item.priority1EndDate),
    });
  }
  if (item.priority2StartDate) {
    events.push({
      eventType: "priority_2",
      startsAt: item.priority2StartDate,
      endsAt: item.priority2EndDate || null,
      displayLabel: "2순위 청약",
      status: status(item.priority2StartDate, item.priority2EndDate),
    });
  }
  if (item.winnerAnnouncementDate) {
    events.push({
      eventType: "winner_announcement",
      startsAt: item.winnerAnnouncementDate,
      endsAt: null,
      displayLabel: "당첨자 발표",
      status: today >= item.winnerAnnouncementDate ? "completed" : "upcoming",
    });
  }
  if (item.contractStartDate) {
    events.push({
      eventType: "contract",
      startsAt: item.contractStartDate,
      endsAt: item.contractEndDate || null,
      displayLabel: "계약",
      status: status(item.contractStartDate, item.contractEndDate),
    });
  }
  if (item.moveInDate) {
    events.push({
      eventType: "move_in",
      startsAt: item.moveInDate,
      endsAt: null,
      displayLabel: "입주 예정",
      status: today >= item.moveInDate ? "completed" : "upcoming",
    });
  }

  return events;
}

@Injectable()
export class DbWriter {
  constructor(private readonly prisma: PrismaService) {}

  async upsertOfferings(items: RawOffering[]): Promise<WriteResult> {
    let upserted = 0;
    let errors = 0;
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    for (const item of items) {
      try {
        const currentStage = computeStage(item, today);
        const { label: nextScheduleLabel, at: nextScheduleAt } =
          computeNextSchedule(item, today);

        await this.prisma.housingOffering.upsert({
          where: { id: item.offerNo },
          update: {
            complexName: item.complexName,
            regionLabel: item.region,
            addressFull: item.addressFull,
            ...(item.latitude !== 0 && item.longitude !== 0
              ? { latitude: item.latitude, longitude: item.longitude }
              : {}),
            totalHouseholds: item.totalHouseholds,
            announcementDate: item.announcementDate,
            moveInPlannedAt: item.moveInDate,
            developerName: item.developerName,
            builderName: item.builderName,
            currentStage: currentStage as any,
            nextScheduleLabel,
            nextScheduleAt,
            dataCheckedAt: new Date(),
          },
          create: {
            id: item.offerNo,
            slug: item.offerNo,
            complexName: item.complexName,
            regionLabel: item.region,
            addressFull: item.addressFull,
            latitude: item.latitude,
            longitude: item.longitude,
            offeringType: "private_sale",
            saleCategory: "apt",
            currentStage: currentStage as any,
            announcementName: item.complexName,
            announcementDate: item.announcementDate,
            moveInPlannedAt: item.moveInDate,
            totalHouseholds: item.totalHouseholds,
            developerName: item.developerName,
            builderName: item.builderName,
            supplySummary: "",
            summaryText: "",
            minSalePrice: BigInt(0),
            maxSalePrice: BigInt(0),
            areaRangeLabel: "",
            nextScheduleLabel,
            nextScheduleAt,
          },
        });

        // 스케줄 이벤트: 기존 삭제 후 재생성
        await this.prisma.scheduleEvent.deleteMany({
          where: { offeringId: item.offerNo },
        });
        const events = buildScheduleEvents(item, today);
        if (events.length > 0) {
          await this.prisma.scheduleEvent.createMany({
            data: events.map((e) => ({ ...e, offeringId: item.offerNo })),
          });
        }

        upserted++;
      } catch (err) {
        console.error(`[DbWriter] upsert failed for ${item.offerNo}:`, err);
        errors++;
      }
    }

    return { upserted, errors };
  }
}
