import { Body, Controller, Get, NotFoundException, Patch, Put, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { JwtPayload } from "../auth/strategies/jwt.strategy";
import { UsersService, type UserProfileDto } from "./users.service";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me/profile")
  async getProfile(@Req() req: Request & { user: JwtPayload }) {
    const profile = await this.usersService.getProfile(req.user.sub);
    if (!profile) {
      throw new NotFoundException("Profile not found");
    }
    return profile;
  }

  @Put("me/profile")
  putProfile(@Req() req: Request & { user: JwtPayload }, @Body() body: UserProfileDto) {
    return this.usersService.upsertProfile(req.user.sub, body);
  }

  @Patch("me/profile")
  patchProfile(@Req() req: Request & { user: JwtPayload }, @Body() body: UserProfileDto) {
    return this.usersService.upsertProfile(req.user.sub, body);
  }
}
