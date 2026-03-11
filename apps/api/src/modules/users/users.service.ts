import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export interface UserProfileDto {
  residenceRegion1?: string;
  residenceRegion2?: string | null;
  isHomeless?: boolean;
  isHeadOfHousehold?: boolean;
  hasSubscriptionAccount?: boolean;
  subscriptionPeriodMonths?: number;
  specialSupplyFlags?: string[];
  budgetMax?: number | null;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) return null;

    return {
      ...profile,
      budgetMax: profile.budgetMax !== null ? Number(profile.budgetMax) : null,
    };
  }

  async upsertProfile(userId: string, data: UserProfileDto) {
    const profile = await this.prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...(data.residenceRegion1 !== undefined && { residenceRegion1: data.residenceRegion1 }),
        ...(data.residenceRegion2 !== undefined && { residenceRegion2: data.residenceRegion2 }),
        ...(data.isHomeless !== undefined && { isHomeless: data.isHomeless }),
        ...(data.isHeadOfHousehold !== undefined && { isHeadOfHousehold: data.isHeadOfHousehold }),
        ...(data.hasSubscriptionAccount !== undefined && {
          hasSubscriptionAccount: data.hasSubscriptionAccount,
        }),
        ...(data.subscriptionPeriodMonths !== undefined && {
          subscriptionPeriodMonths: data.subscriptionPeriodMonths,
        }),
        ...(data.specialSupplyFlags !== undefined && {
          specialSupplyFlags: data.specialSupplyFlags as any,
        }),
        ...(data.budgetMax !== undefined && {
          budgetMax: data.budgetMax !== null ? BigInt(data.budgetMax) : null,
        }),
      },
      create: {
        userId,
        residenceRegion1: data.residenceRegion1 ?? "",
        residenceRegion2: data.residenceRegion2,
        isHomeless: data.isHomeless ?? false,
        isHeadOfHousehold: data.isHeadOfHousehold ?? false,
        hasSubscriptionAccount: data.hasSubscriptionAccount ?? false,
        subscriptionPeriodMonths: data.subscriptionPeriodMonths ?? 0,
        specialSupplyFlags: (data.specialSupplyFlags ?? []) as any,
        budgetMax: data.budgetMax !== undefined && data.budgetMax !== null
          ? BigInt(data.budgetMax)
          : null,
      },
    });

    return {
      ...profile,
      budgetMax: profile.budgetMax !== null ? Number(profile.budgetMax) : null,
    };
  }
}
