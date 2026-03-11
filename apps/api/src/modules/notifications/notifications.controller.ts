import { Body, Controller, Delete, Get, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { JwtPayload } from "../auth/strategies/jwt.strategy";
import { NotificationsService, type PushSubscriptionDto } from "./notifications.service";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get("vapid-public-key")
  getVapidPublicKey() {
    return { publicKey: this.notificationsService.getVapidPublicKey() };
  }

  @Post("subscribe")
  @UseGuards(JwtAuthGuard)
  subscribe(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: PushSubscriptionDto,
  ) {
    return this.notificationsService.subscribe(req.user.sub, dto);
  }

  @Delete("subscribe")
  @UseGuards(JwtAuthGuard)
  unsubscribe(
    @Req() req: Request & { user: JwtPayload },
    @Body() body: { endpoint: string },
  ) {
    return this.notificationsService.unsubscribe(req.user.sub, body.endpoint);
  }
}
