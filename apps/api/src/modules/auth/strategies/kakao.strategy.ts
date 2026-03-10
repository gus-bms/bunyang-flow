import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-kakao";

export interface KakaoProfile {
  id: string;
  email?: string;
  nickname: string;
  profileImageUrl?: string;
}

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, "kakao") {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID ?? "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
      callbackURL: process.env.KAKAO_CALLBACK_URL ?? "http://localhost:4000/auth/kakao/callback",
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: {
      id: string;
      _json: {
        kakao_account?: {
          email?: string;
          profile?: {
            nickname?: string;
            profile_image_url?: string;
          };
        };
      };
    },
  ): KakaoProfile {
    const kakaoAccount = profile._json.kakao_account ?? {};
    return {
      id: String(profile.id),
      email: kakaoAccount.email,
      nickname: kakaoAccount.profile?.nickname ?? "카카오 사용자",
      profileImageUrl: kakaoAccount.profile?.profile_image_url,
    };
  }
}
