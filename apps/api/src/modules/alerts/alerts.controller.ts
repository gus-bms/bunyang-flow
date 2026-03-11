import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ScheduleEventType } from "@prisma/client";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { JwtPayload } from "../auth/strategies/jwt.strategy";
import { AlertsService } from "./alerts.service";

@Controller("alerts")
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  list(@Req() req: Request & { user: JwtPayload }) {
    return this.alertsService.list(req.user.sub);
  }

  @Post()
  add(
    @Req() req: Request & { user: JwtPayload },
    @Body("offeringId") offeringId: string,
    @Body("eventTypes") eventTypes: ScheduleEventType[],
  ) {
    return this.alertsService.upsert(req.user.sub, offeringId, eventTypes ?? []);
  }

  @Patch(":offeringId")
  update(
    @Req() req: Request & { user: JwtPayload },
    @Param("offeringId") offeringId: string,
    @Body("eventTypes") eventTypes: ScheduleEventType[],
  ) {
    return this.alertsService.update(req.user.sub, offeringId, eventTypes);
  }

  @Delete(":offeringId")
  remove(@Req() req: Request & { user: JwtPayload }, @Param("offeringId") offeringId: string) {
    return this.alertsService.remove(req.user.sub, offeringId);
  }
}
