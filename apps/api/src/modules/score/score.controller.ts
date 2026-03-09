import { Body, Controller, Get, Post } from "@nestjs/common";

import { ScoreInputDto } from "./dto";
import { ScoreService } from "./score.service";

@Controller("score")
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Post("calculate")
  calculate(@Body() input: ScoreInputDto) {
    return this.scoreService.calculate(input);
  }

  @Get("me")
  getMyScore() {
    return this.scoreService.getMyScore();
  }
}
