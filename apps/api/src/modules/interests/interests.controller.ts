import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { JwtPayload } from "../auth/strategies/jwt.strategy";
import { InterestsService } from "./interests.service";

@Controller("interests")
@UseGuards(JwtAuthGuard)
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Get()
  list(@Req() req: Request & { user: JwtPayload }) {
    return this.interestsService.list(req.user.sub);
  }

  @Post()
  add(@Req() req: Request & { user: JwtPayload }, @Body("offeringId") offeringId: string) {
    return this.interestsService.add(req.user.sub, offeringId);
  }

  @Delete(":offeringId")
  remove(@Req() req: Request & { user: JwtPayload }, @Param("offeringId") offeringId: string) {
    return this.interestsService.remove(req.user.sub, offeringId);
  }
}
