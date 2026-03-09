import { IsNumber, Max, Min } from "class-validator";

export class ScoreInputDto {
  @IsNumber()
  @Min(0)
  @Max(30)
  homelessPeriodYears!: number;

  @IsNumber()
  @Min(0)
  @Max(6)
  dependentCount!: number;

  @IsNumber()
  @Min(0)
  @Max(30)
  subscriptionPeriodYears!: number;
}
