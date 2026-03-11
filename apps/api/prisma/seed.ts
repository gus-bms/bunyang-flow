import { PrismaClient } from "@prisma/client";
import { mockOfferings } from "@bunyang-flow/shared";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  for (const offering of mockOfferings) {
    // Use the mock id as the DB id so existing frontend routes work
    await prisma.housingOffering.upsert({
      where: { id: offering.id },
      update: {},
      create: {
        id: offering.id,
        slug: offering.slug,
        complexName: offering.complexName,
        regionLabel: offering.regionLabel,
        addressFull: offering.addressFull,
        latitude: offering.latitude,
        longitude: offering.longitude,
        offeringType: offering.offeringType,
        saleCategory: offering.saleCategory,
        currentStage: offering.currentStage,
        announcementName: offering.announcementName,
        announcementDate: offering.announcementDate,
        moveInPlannedAt: offering.moveInPlannedAt,
        dataCheckedAt: new Date(offering.dataCheckedAt),
        totalHouseholds: offering.totalHouseholds,
        developerName: offering.developerName,
        builderName: offering.builderName,
        supplySummary: offering.supplySummary,
        summaryText: offering.summaryText,
        minSalePrice: BigInt(offering.minSalePrice),
        maxSalePrice: BigInt(offering.maxSalePrice),
        areaRangeLabel: offering.areaRangeLabel,
        nextScheduleLabel: offering.nextScheduleLabel,
        nextScheduleAt: offering.nextScheduleAt,
        noticeHighlights: offering.noticeHighlights,
        locationHighlights: offering.locationHighlights,

        housingTypes: {
          create: offering.housingTypes.map((ht) => ({
            typeName: ht.typeName,
            exclusiveAreaM2: ht.exclusiveAreaM2,
            supplyHouseholdsTotal: ht.supplyHouseholdsTotal,
            supplyHouseholdsGeneral: ht.supplyHouseholdsGeneral,
            supplyHouseholdsSpecial: ht.supplyHouseholdsSpecial,
            salePriceMin: BigInt(ht.salePriceMin),
            salePriceMax: BigInt(ht.salePriceMax),
            contractDepositRate: ht.contractDepositRate,
            middlePaymentRate: ht.middlePaymentRate,
            balanceRate: ht.balanceRate,
            optionPriceNote: ht.optionPriceNote ?? null,
          })),
        },

        scheduleEvents: {
          create: offering.scheduleEvents.map((se) => ({
            eventType: se.eventType,
            startsAt: se.startsAt,
            endsAt: se.endsAt ?? null,
            displayLabel: se.displayLabel,
            status: se.status,
          })),
        },

        supplyRules: {
          create: offering.supplyRules.map((sr) => ({
            supplyKind: sr.supplyKind,
            specialSupplyType: sr.specialSupplyType ?? null,
            residentRegionRule: sr.residentRegionRule,
            homelessRequired: sr.homelessRequired,
            headOfHouseholdRequired: sr.headOfHouseholdRequired,
            subscriptionAccountRequired: sr.subscriptionAccountRequired,
            subscriptionMinPeriodMonths: sr.subscriptionMinPeriodMonths,
            incomeRuleText: sr.incomeRuleText ?? null,
            assetRuleText: sr.assetRuleText ?? null,
            noteText: sr.noteText ?? null,
          })),
        },

        regulationInfo: offering.regulationInfo
          ? {
              create: {
                priceCapApplied: offering.regulationInfo.priceCapApplied,
                resaleRestrictionMonths: offering.regulationInfo.resaleRestrictionMonths,
                resaleRestrictionNote: offering.regulationInfo.resaleRestrictionNote,
                residencyObligationMonths: offering.regulationInfo.residencyObligationMonths,
                rewinRestrictionYears: offering.regulationInfo.rewinRestrictionYears,
                speculationZoneType: offering.regulationInfo.speculationZoneType,
                interimLoanAvailable: offering.regulationInfo.interimLoanAvailable,
                interimLoanNote: offering.regulationInfo.interimLoanNote,
              },
            }
          : undefined,

        competitionRates:
          offering.competitionRates.length > 0
            ? {
                create: offering.competitionRates.map((cr) => ({
                  typeName: cr.typeName,
                  supplyKind: cr.supplyKind,
                  specialSupplyType: cr.specialSupplyType ?? null,
                  recruitmentCount: cr.recruitmentCount,
                  applicantCount: cr.applicantCount,
                  competitionRatio: cr.competitionRatio,
                  minWinningScore: cr.minWinningScore ?? null,
                  maxWinningScore: cr.maxWinningScore ?? null,
                  avgWinningScore: cr.avgWinningScore ?? null,
                })),
              }
            : undefined,
      },
    });

    console.log(`  Seeded: ${offering.complexName} (${offering.id})`);
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
