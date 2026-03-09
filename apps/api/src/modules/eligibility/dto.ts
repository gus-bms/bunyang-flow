import { type SpecialSupplyType } from "@bunyang-flow/shared";
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class EligibilityInputDto {
  @IsString()
  residenceRegion1!: string;

  @IsOptional()
  @IsString()
  residenceRegion2?: string;

  @IsBoolean()
  isHomeless!: boolean;

  @IsBoolean()
  isHeadOfHousehold!: boolean;

  @IsBoolean()
  hasSubscriptionAccount!: boolean;

  @IsNumber()
  subscriptionPeriodMonths!: number;

  @IsArray()
  @IsString({ each: true })
  specialSupplyFlags!: SpecialSupplyType[];

  @IsOptional()
  @IsNumber()
  budgetMax?: number;

  @IsOptional()
  @IsString()
  offeringId?: string;
}
