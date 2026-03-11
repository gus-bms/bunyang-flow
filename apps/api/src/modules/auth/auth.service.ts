import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { KakaoProfile } from "./strategies/kakao.strategy";
import type { AuthUser } from "@bunyang-flow/shared";
import { PrismaService } from "../../prisma/prisma.service";

const REFRESH_EXPIRY_DAYS = 7;
const REFRESH_EXPIRY_SECONDS = REFRESH_EXPIRY_DAYS * 24 * 60 * 60;

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async login(kakaoProfile: KakaoProfile): Promise<LoginResult> {
    await this.prisma.user.upsert({
      where: { id: kakaoProfile.id },
      update: {
        email: kakaoProfile.email,
        nickname: kakaoProfile.nickname,
        profileImageUrl: kakaoProfile.profileImageUrl,
      },
      create: {
        id: kakaoProfile.id,
        email: kakaoProfile.email,
        nickname: kakaoProfile.nickname,
        profileImageUrl: kakaoProfile.profileImageUrl,
      },
    });

    const payload = {
      sub: kakaoProfile.id,
      email: kakaoProfile.email,
      nickname: kakaoProfile.nickname,
      profileImageUrl: kakaoProfile.profileImageUrl,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { ...payload, type: "refresh" },
      {
        secret: (process.env.JWT_SECRET ?? "bunyang-flow-dev-secret") + "-refresh",
        expiresIn: `${REFRESH_EXPIRY_DAYS}d`,
      },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: kakaoProfile.id,
        email: kakaoProfile.email,
        nickname: kakaoProfile.nickname,
        profileImageUrl: kakaoProfile.profileImageUrl,
      },
    };
  }

  refreshAccessToken(payload: {
    sub: string;
    email?: string;
    nickname: string;
    profileImageUrl?: string;
  }): string {
    const { sub, email, nickname, profileImageUrl } = payload;
    return this.jwtService.sign({ sub, email, nickname, profileImageUrl });
  }

  getProfile(payload: { sub: string; email?: string; nickname: string; profileImageUrl?: string }): AuthUser {
    return {
      id: payload.sub,
      email: payload.email,
      nickname: payload.nickname,
      profileImageUrl: payload.profileImageUrl,
    };
  }

  get refreshCookieOptions() {
    return {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      maxAge: REFRESH_EXPIRY_SECONDS * 1000,
      path: "/",
    };
  }
}
