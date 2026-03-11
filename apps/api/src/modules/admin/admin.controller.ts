import { Body, Controller, ForbiddenException, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { JwtPayload } from "../auth/strategies/jwt.strategy";
import { AdminService } from "./admin.service";
import type { Prisma } from "@prisma/client";

@Controller("admin")
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private assertAdmin(user: JwtPayload) {
    // JWT payload에 role 클레임이 없는 경우 DB 확인 없이 간이 차단
    // TODO: user.role 클레임을 JWT에 포함시키거나 DB에서 확인하는 방식으로 강화
    if ((user as any).role !== "admin") {
      throw new ForbiddenException("Admin only");
    }
  }

  @Post("offerings")
  create(
    @Req() req: Request & { user: JwtPayload },
    @Body() body: Prisma.HousingOfferingCreateInput,
  ) {
    this.assertAdmin(req.user);
    return this.adminService.createOffering(body);
  }

  @Patch("offerings/:id")
  update(
    @Req() req: Request & { user: JwtPayload },
    @Param("id") id: string,
    @Body() body: Prisma.HousingOfferingUpdateInput,
  ) {
    this.assertAdmin(req.user);
    return this.adminService.updateOffering(id, body);
  }

  @Post("collect")
  collect(@Req() req: Request & { user: JwtPayload }) {
    this.assertAdmin(req.user);
    return this.adminService.triggerCollection();
  }

  @Post("seed")
  seed(@Req() req: Request & { user: JwtPayload }) {
    this.assertAdmin(req.user);
    return this.adminService.reseed();
  }
}
