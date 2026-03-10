import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import type { KakaoProfile } from "./strategies/kakao.strategy";
import type { JwtPayload } from "./strategies/jwt.strategy";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("kakao")
  @UseGuards(AuthGuard("kakao"))
  kakaoLogin(): void {
    // passport-kakao가 카카오 로그인 페이지로 리디렉트
  }

  @Get("kakao/callback")
  @UseGuards(AuthGuard("kakao"))
  kakaoCallback(@Req() req: Request & { user: KakaoProfile }, @Res() res: Response): void {
    const { token } = this.authService.login(req.user);
    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
    res.redirect(`${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: Request & { user: JwtPayload }) {
    return this.authService.getProfile(req.user);
  }
}
