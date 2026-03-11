import { Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import type { KakaoProfile } from "./strategies/kakao.strategy";
import type { JwtPayload } from "./strategies/jwt.strategy";
import type { JwtRefreshPayload } from "./strategies/jwt-refresh.strategy";

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
  async kakaoCallback(@Req() req: Request & { user: KakaoProfile }, @Res() res: Response): Promise<void> {
    const { accessToken, refreshToken } = await this.authService.login(req.user);
    res.cookie("refresh_token", refreshToken, this.authService.refreshCookieOptions);
    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
    res.redirect(`${frontendUrl}/auth/callback?token=${encodeURIComponent(accessToken)}`);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: Request & { user: JwtPayload }) {
    return this.authService.getProfile(req.user);
  }

  @Post("refresh")
  @UseGuards(AuthGuard("jwt-refresh"))
  refresh(@Req() req: Request & { user: JwtRefreshPayload }, @Res() res: Response): void {
    const newAccessToken = this.authService.refreshAccessToken(req.user);
    res.json({ accessToken: newAccessToken });
  }

  @Post("logout")
  logout(@Res() res: Response): void {
    res.clearCookie("refresh_token", { path: "/" });
    res.json({ ok: true });
  }
}
