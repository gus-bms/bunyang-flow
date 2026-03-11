import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async list(offeringIds?: string[]) {
    const events = await this.prisma.scheduleEvent.findMany({
      where: offeringIds?.length ? { offeringId: { in: offeringIds } } : undefined,
      include: {
        offering: {
          select: {
            id: true,
            complexName: true,
            currentStage: true,
          },
        },
      },
    });

    const items = events
      .map((event) => ({
        id: `${event.offeringId}-${event.id}`,
        offeringId: event.offeringId,
        complexName: event.offering.complexName,
        stage: event.offering.currentStage,
        eventType: event.eventType,
        label: event.displayLabel,
        date: event.startsAt,
        status: event.status,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { items };
  }
}
