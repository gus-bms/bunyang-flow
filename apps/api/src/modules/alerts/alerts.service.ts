import { Injectable, NotFoundException } from "@nestjs/common";
import { ScheduleEventType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const records = await this.prisma.userAlert.findMany({
      where: { userId },
      include: {
        offering: {
          select: {
            id: true,
            complexName: true,
            regionLabel: true,
            currentStage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { items: records };
  }

  async upsert(userId: string, offeringId: string, eventTypes: ScheduleEventType[]) {
    const offering = await this.prisma.housingOffering.findUnique({ where: { id: offeringId } });
    if (!offering) throw new NotFoundException(`Offering ${offeringId} not found`);

    const record = await this.prisma.userAlert.upsert({
      where: { userId_offeringId: { userId, offeringId } },
      update: { eventTypes },
      create: { userId, offeringId, eventTypes },
    });

    return record;
  }

  async update(userId: string, offeringId: string, eventTypes: ScheduleEventType[]) {
    const record = await this.prisma.userAlert.findUnique({
      where: { userId_offeringId: { userId, offeringId } },
    });
    if (!record) throw new NotFoundException("Alert not found");

    return this.prisma.userAlert.update({
      where: { userId_offeringId: { userId, offeringId } },
      data: { eventTypes },
    });
  }

  async remove(userId: string, offeringId: string) {
    const record = await this.prisma.userAlert.findUnique({
      where: { userId_offeringId: { userId, offeringId } },
    });
    if (!record) throw new NotFoundException("Alert not found");

    await this.prisma.userAlert.delete({
      where: { userId_offeringId: { userId, offeringId } },
    });

    return { offeringId };
  }
}
