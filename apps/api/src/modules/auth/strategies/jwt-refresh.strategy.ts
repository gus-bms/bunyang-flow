import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";

export interface JwtRefreshPayload {
  sub: string;
  email?: string;
  nickname: string;
  profileImageUrl?: string;
  type: string;
}

function cookieExtractor(req: { cookies?: Record<string, string> }): string | null {
  return req?.cookies?.refresh_token ?? null;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor() {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: (process.env.JWT_SECRET ?? "bunyang-flow-dev-secret") + "-refresh",
    });
  }

  validate(payload: JwtRefreshPayload): JwtRefreshPayload {
    if (payload.type !== "refresh") {
      throw new UnauthorizedException("Invalid refresh token");
    }
    return payload;
  }
}
