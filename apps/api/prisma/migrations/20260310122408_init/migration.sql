-- CreateEnum
CREATE TYPE "OfferingStage" AS ENUM ('planned', 'announcement_open', 'special_supply_open', 'priority_1_open', 'priority_2_open', 'winner_announced', 'contract_open', 'move_in_pending', 'closed');

-- CreateEnum
CREATE TYPE "ScheduleEventType" AS ENUM ('announcement', 'special_supply', 'priority_1', 'priority_2', 'winner_announcement', 'contract', 'move_in');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('upcoming', 'ongoing', 'completed');

-- CreateEnum
CREATE TYPE "OfferingType" AS ENUM ('private_sale', 'public_sale');

-- CreateEnum
CREATE TYPE "SaleCategory" AS ENUM ('apt', 'officetel', 'public_housing');

-- CreateEnum
CREATE TYPE "SupplyKind" AS ENUM ('general', 'special');

-- CreateEnum
CREATE TYPE "SpecialSupplyType" AS ENUM ('newlywed', 'first_time_buyer', 'multi_child', 'elder_support', 'institution_recommendation');

-- CreateEnum
CREATE TYPE "SpeculationZoneType" AS ENUM ('speculation_overheated', 'adjustment_target', 'non_regulated');

-- CreateTable
CREATE TABLE "HousingOffering" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "complexName" TEXT NOT NULL,
    "regionLabel" TEXT NOT NULL,
    "addressFull" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "offeringType" "OfferingType" NOT NULL,
    "saleCategory" "SaleCategory" NOT NULL,
    "currentStage" "OfferingStage" NOT NULL DEFAULT 'planned',
    "announcementName" TEXT NOT NULL,
    "announcementDate" TEXT NOT NULL,
    "moveInPlannedAt" TEXT NOT NULL,
    "dataCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalHouseholds" INTEGER NOT NULL,
    "developerName" TEXT NOT NULL,
    "builderName" TEXT NOT NULL,
    "supplySummary" TEXT NOT NULL,
    "summaryText" TEXT NOT NULL,
    "minSalePrice" BIGINT NOT NULL DEFAULT 0,
    "maxSalePrice" BIGINT NOT NULL DEFAULT 0,
    "areaRangeLabel" TEXT NOT NULL,
    "nextScheduleLabel" TEXT NOT NULL,
    "nextScheduleAt" TEXT NOT NULL,
    "noticeHighlights" TEXT[],
    "locationHighlights" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HousingOffering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HousingType" (
    "id" TEXT NOT NULL,
    "typeName" TEXT NOT NULL,
    "exclusiveAreaM2" DOUBLE PRECISION NOT NULL,
    "supplyHouseholdsTotal" INTEGER NOT NULL,
    "supplyHouseholdsGeneral" INTEGER NOT NULL,
    "supplyHouseholdsSpecial" INTEGER NOT NULL,
    "salePriceMin" BIGINT NOT NULL,
    "salePriceMax" BIGINT NOT NULL,
    "contractDepositRate" INTEGER NOT NULL,
    "middlePaymentRate" INTEGER NOT NULL,
    "balanceRate" INTEGER NOT NULL,
    "optionPriceNote" TEXT,
    "offeringId" TEXT NOT NULL,

    CONSTRAINT "HousingType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleEvent" (
    "id" TEXT NOT NULL,
    "eventType" "ScheduleEventType" NOT NULL,
    "startsAt" TEXT NOT NULL,
    "endsAt" TEXT,
    "displayLabel" TEXT NOT NULL,
    "status" "ScheduleStatus" NOT NULL,
    "offeringId" TEXT NOT NULL,

    CONSTRAINT "ScheduleEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplyRule" (
    "id" TEXT NOT NULL,
    "supplyKind" "SupplyKind" NOT NULL,
    "specialSupplyType" "SpecialSupplyType",
    "residentRegionRule" TEXT NOT NULL,
    "homelessRequired" BOOLEAN NOT NULL,
    "headOfHouseholdRequired" BOOLEAN NOT NULL,
    "subscriptionAccountRequired" BOOLEAN NOT NULL,
    "subscriptionMinPeriodMonths" INTEGER NOT NULL,
    "incomeRuleText" TEXT,
    "assetRuleText" TEXT,
    "noteText" TEXT,
    "offeringId" TEXT NOT NULL,

    CONSTRAINT "SupplyRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegulationInfo" (
    "id" TEXT NOT NULL,
    "priceCapApplied" BOOLEAN NOT NULL,
    "resaleRestrictionMonths" INTEGER NOT NULL,
    "resaleRestrictionNote" TEXT NOT NULL,
    "residencyObligationMonths" INTEGER NOT NULL,
    "rewinRestrictionYears" INTEGER NOT NULL,
    "speculationZoneType" "SpeculationZoneType" NOT NULL,
    "interimLoanAvailable" BOOLEAN NOT NULL,
    "interimLoanNote" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,

    CONSTRAINT "RegulationInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitionRate" (
    "id" TEXT NOT NULL,
    "typeName" TEXT NOT NULL,
    "supplyKind" "SupplyKind" NOT NULL,
    "specialSupplyType" "SpecialSupplyType",
    "recruitmentCount" INTEGER NOT NULL,
    "applicantCount" INTEGER NOT NULL,
    "competitionRatio" DOUBLE PRECISION NOT NULL,
    "minWinningScore" INTEGER,
    "maxWinningScore" INTEGER,
    "avgWinningScore" INTEGER,
    "offeringId" TEXT NOT NULL,

    CONSTRAINT "CompetitionRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "nickname" TEXT NOT NULL,
    "profileImageUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "residenceRegion1" TEXT NOT NULL DEFAULT '',
    "residenceRegion2" TEXT,
    "isHomeless" BOOLEAN NOT NULL DEFAULT false,
    "isHeadOfHousehold" BOOLEAN NOT NULL DEFAULT false,
    "hasSubscriptionAccount" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionPeriodMonths" INTEGER NOT NULL DEFAULT 0,
    "specialSupplyFlags" "SpecialSupplyType"[],
    "budgetMax" BIGINT,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserScore" (
    "id" TEXT NOT NULL,
    "homelessPeriodYears" INTEGER NOT NULL DEFAULT 0,
    "dependentCount" INTEGER NOT NULL DEFAULT 0,
    "subscriptionPeriodYears" INTEGER NOT NULL DEFAULT 0,
    "homelessScore" INTEGER NOT NULL DEFAULT 0,
    "dependentScore" INTEGER NOT NULL DEFAULT 0,
    "subscriptionScore" INTEGER NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "assessmentLabel" TEXT NOT NULL DEFAULT '',
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInterest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,

    CONSTRAINT "UserInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAlert" (
    "id" TEXT NOT NULL,
    "eventTypes" "ScheduleEventType"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,

    CONSTRAINT "UserAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HousingOffering_slug_key" ON "HousingOffering"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RegulationInfo_offeringId_key" ON "RegulationInfo"("offeringId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserScore_userId_key" ON "UserScore"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserInterest_userId_offeringId_key" ON "UserInterest"("userId", "offeringId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAlert_userId_offeringId_key" ON "UserAlert"("userId", "offeringId");

-- AddForeignKey
ALTER TABLE "HousingType" ADD CONSTRAINT "HousingType_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "HousingOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleEvent" ADD CONSTRAINT "ScheduleEvent_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "HousingOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyRule" ADD CONSTRAINT "SupplyRule_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "HousingOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegulationInfo" ADD CONSTRAINT "RegulationInfo_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "HousingOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionRate" ADD CONSTRAINT "CompetitionRate_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "HousingOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserScore" ADD CONSTRAINT "UserScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "HousingOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAlert" ADD CONSTRAINT "UserAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAlert" ADD CONSTRAINT "UserAlert_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "HousingOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;
