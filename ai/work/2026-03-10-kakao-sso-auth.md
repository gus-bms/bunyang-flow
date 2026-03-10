# 카카오 SSO 로그인 구현 작업 로그

작성일: 2026-03-10

---

## 완료된 작업

### 1. 공유 타입 (`packages/shared/src/types.ts`)
- `AuthUser` 인터페이스 추가 (`id`, `email?`, `nickname`, `profileImageUrl?`)

### 2. 백엔드 패키지 설치 (`apps/api`)
- `@nestjs/passport`, `@nestjs/jwt`, `@nestjs/config`
- `passport`, `passport-kakao`, `passport-jwt`
- `@types/passport-kakao`, `@types/passport-jwt` (dev)

### 3. 백엔드 AuthModule (`apps/api/src/modules/auth/`)
| 파일 | 역할 |
|------|------|
| `strategies/kakao.strategy.ts` | passport-kakao Strategy — 카카오 프로필 추출 |
| `strategies/jwt.strategy.ts` | passport-jwt Strategy — Bearer 토큰 검증 |
| `guards/jwt-auth.guard.ts` | JwtAuthGuard — `@UseGuards(JwtAuthGuard)` |
| `auth.service.ts` | `login()` (JWT 발급), `getProfile()` |
| `auth.controller.ts` | GET /auth/kakao, /auth/kakao/callback, /auth/me |
| `auth.module.ts` | PassportModule + JwtModule 등록 |

### 4. AppModule 등록 (`apps/api/src/app.module.ts`)
- `AuthModule` import 추가

### 5. 환경 변수 예시 (`apps/api/.env.example`)
```
KAKAO_CLIENT_ID=...
KAKAO_CLIENT_SECRET=...
KAKAO_CALLBACK_URL=http://localhost:4000/auth/kakao/callback
JWT_SECRET=...
FRONTEND_URL=http://localhost:5173
API_PORT=4000
```

### 6. 프론트엔드 Auth Store (`apps/web/src/store/auth.ts`)
- Zustand + persist 스토어
- `user: AuthUser | null`, `token: string | null`
- `login(user, token)`, `logout()` actions

### 7. 신규 페이지
| 파일 | 경로 | 역할 |
|------|------|------|
| `LoginPage.tsx` | `/login` | 카카오 로그인 버튼 UI |
| `KakaoCallbackPage.tsx` | `/auth/callback` | URL token 파라미터 읽기 → /auth/me 조회 → 저장 → 홈 이동 |

### 8. API 클라이언트 (`apps/web/src/lib/api.ts`)
- `getAuthToken()`: localStorage에서 bunyang-flow-auth 파싱해 JWT 추출
- `fetchJson()`: 토큰 있을 때 `Authorization: Bearer <token>` 자동 주입

### 9. App.tsx 라우트 추가
- `/login` → `<LoginPage>`
- `/auth/callback` → `<KakaoCallbackPage>`

### 10. AppShell.tsx 로그인 UI
- 비로그인: "카카오 로그인" 버튼 (kakao-login-button--small) → /login
- 로그인: 프로필 이미지 + 닉네임 + "로그아웃" 버튼

### 11. CSS (`apps/web/src/styles.css`)
- `.kakao-login-button` — 카카오 노란색 (#fee500) 버튼
- `.kakao-login-button--small` — AppShell용 소형 변형
- `.auth-user`, `.auth-user__avatar`, `.auth-user__name` — 로그인 상태 표시

---

## 인증 플로우 요약

```
사용자 → "카카오 로그인" 클릭
       → /login 페이지 → window.location = /auth/kakao (백엔드)
       → Kakao OAuth 동의 화면
       → /auth/kakao/callback (백엔드)
       → JWT 발급 → 프론트엔드 /auth/callback?token=xxx 리디렉트
       → KakaoCallbackPage: GET /auth/me with Bearer token
       → useAuthStore.login(user, token) 저장
       → 홈(/) 이동
```

---

## 오픈 이슈

- **카카오 개발자 콘솔 설정 필요**: `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`, Redirect URI 등록
- **JWT Secret 프로덕션 교체 필요**: 현재 dev 기본값 사용
- **서버사이드 관심/알림 동기화**: 로그인 후 Zustand state를 서버 DB에 연동하는 작업 미구현 (다음 스프린트)
- **토큰 갱신(Refresh)**: 현재 7일 만료 후 재로그인 필요. Refresh Token 흐름 미구현
