import { Transform } from "class-transformer";
import { IsArray, IsOptional, IsString } from "class-validator";

import { toCsvArray } from "../../common/dto/csv-array.transformer";

export class GetScheduleQueryDto {
  @IsOptional()
  @Transform(({ value }) => toCsvArray(value))
  @IsArray()
  @IsString({ each: true })
  offeringIds?: string[];
}
