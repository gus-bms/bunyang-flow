import { Controller, Get, Query } from "@nestjs/common";

import { GetScheduleQueryDto } from "./dto";
import { ScheduleService } from "./schedule.service";

@Controller("schedule")
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  getSchedule(@Query() query: GetScheduleQueryDto) {
    return this.scheduleService.list(query.offeringIds);
  }
}
