import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { KakaoProfile } from "./strategies/kakao.strategy";
import type { AuthUser } from "@bunyang-flow/shared";

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  login(kakaoProfile: KakaoProfile): { token: string; user: AuthUser } {
    const payload = {
      sub: kakaoProfile.id,
      email: kakaoProfile.email,
      nickname: kakaoProfile.nickname,
      profileImageUrl: kakaoProfile.profileImageUrl,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: kakaoProfile.id,
        email: kakaoProfile.email,
        nickname: kakaoProfile.nickname,
        profileImageUrl: kakaoProfile.profileImageUrl,
      },
    };
  }

  getProfile(payload: { sub: string; email?: string; nickname: string; profileImageUrl?: string }): AuthUser {
    return {
      id: payload.sub,
      email: payload.email,
      nickname: payload.nickname,
      profileImageUrl: payload.profileImageUrl,
    };
  }
}
