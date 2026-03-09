import { offeringStages, type OfferingStage } from "@bunyang-flow/shared";
import { Transform } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

import { toCsvArray } from "../../common/dto/csv-array.transformer";

export class GetOfferingsQueryDto {
  @IsOptional()
  @Transform(({ value }) => toCsvArray(value))
  @IsArray()
  @IsIn(offeringStages, { each: true })
  stages?: OfferingStage[];

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  offeringType?: "private_sale" | "public_sale";

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  minArea?: number;

  @IsOptional()
  @IsString()
  specialSupplyType?: string;
}
