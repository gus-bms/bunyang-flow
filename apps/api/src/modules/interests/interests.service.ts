import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class InterestsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const records = await this.prisma.userInterest.findMany({
      where: { userId },
      include: {
        offering: {
          select: {
            id: true,
            complexName: true,
            regionLabel: true,
            currentStage: true,
            minSalePrice: true,
            nextScheduleLabel: true,
            nextScheduleAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      items: records.map((r) => ({
        offeringId: r.offeringId,
        createdAt: r.createdAt,
        offering: {
          ...r.offering,
          minSalePrice: Number(r.offering.minSalePrice),
        },
      })),
    };
  }

  async add(userId: string, offeringId: string) {
    const offering = await this.prisma.housingOffering.findUnique({ where: { id: offeringId } });
    if (!offering) throw new NotFoundException(`Offering ${offeringId} not found`);

    try {
      await this.prisma.userInterest.create({ data: { userId, offeringId } });
    } catch {
      throw new ConflictException("Already saved");
    }

    return { offeringId };
  }

  async remove(userId: string, offeringId: string) {
    const record = await this.prisma.userInterest.findUnique({
      where: { userId_offeringId: { userId, offeringId } },
    });
    if (!record) throw new NotFoundException("Interest not found");

    await this.prisma.userInterest.delete({
      where: { userId_offeringId: { userId, offeringId } },
    });

    return { offeringId };
  }
}
