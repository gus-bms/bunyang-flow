# 카카오 SSO 로그인 구현 계획

작성일: 2026-03-10

---

## 1. 목표

카카오 OAuth 2.0 기반 SSO 로그인을 구현한다.
- 사용자는 "카카오로 로그인" 버튼을 클릭해 카카오 계정으로 인증한다.
- 백엔드가 인증 코드를 교환하고 카카오 프로필을 받아 자체 JWT를 발급한다.
- 프론트엔드는 JWT를 로컬에 저장하고 이후 API 요청에 Bearer 토큰으로 첨부한다.

---

## 2. 인증 흐름

```
[사용자] → "카카오로 로그인" 클릭
       → GET /auth/kakao (백엔드)
       → 카카오 OAuth 인증 페이지 리디렉트
       → 사용자 카카오 계정 로그인 및 동의
       → 카카오 → GET /auth/kakao/callback?code=xxx (백엔드)
       → 백엔드: 코드 교환 → 카카오 사용자 정보 조회
       → 자체 JWT 발급
       → 프론트엔드 /auth/callback?token=xxx 리디렉트
[프론트엔드] → /auth/callback 페이지에서 token 파라미터 읽기
            → useAuthStore에 저장 (persist)
            → 홈(/)으로 이동
```

---

## 3. 환경 변수

### Backend (`apps/api/.env`)
```
KAKAO_CLIENT_ID=<REST API 키>
KAKAO_CLIENT_SECRET=<보안 비밀>
KAKAO_CALLBACK_URL=http://localhost:4000/auth/kakao/callback
JWT_SECRET=<랜덤 시크릿>
FRONTEND_URL=http://localhost:5173
```

### Frontend (`apps/web/.env`)
```
VITE_API_BASE_URL=http://localhost:4000
```
(이미 존재)

---

## 4. 백엔드 구현 (`apps/api`)

### 4.1 패키지 추가
- `@nestjs/passport`, `@nestjs/jwt`
- `passport`, `passport-kakao`, `@types/passport-kakao`
- `passport-jwt`, `@types/passport-jwt`
- `@nestjs/config` (환경 변수 관리)

### 4.2 파일 구조
```
apps/api/src/modules/auth/
  auth.module.ts
  auth.controller.ts
  auth.service.ts
  strategies/
    kakao.strategy.ts
    jwt.strategy.ts
  guards/
    jwt-auth.guard.ts
```

### 4.3 엔드포인트
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /auth/kakao | 카카오 OAuth 리디렉트 |
| GET | /auth/kakao/callback | 카카오 콜백 → JWT 발급 → 프론트 리디렉트 |
| GET | /auth/me | 현재 사용자 정보 (JWT 필요) |

### 4.4 JWT 페이로드
```json
{
  "sub": "kakao-user-id",
  "email": "user@kakao.com",
  "nickname": "홍길동",
  "profileImageUrl": "https://..."
}
```

---

## 5. 프론트엔드 구현 (`apps/web`)

### 5.1 새 파일
- `src/store/auth.ts` — Zustand persist store (`user`, `token`, `login`, `logout`)
- `src/pages/LoginPage.tsx` — "카카오로 로그인" 버튼 화면
- `src/pages/KakaoCallbackPage.tsx` — URL에서 token 읽어 저장 후 리디렉트

### 5.2 수정 파일
- `src/lib/api.ts` — fetchJson에 Authorization 헤더 자동 첨부
- `src/app/App.tsx` — `/login`, `/auth/callback` 라우트 추가
- `src/components/layout/AppShell.tsx` — 로그인 상태에 따라 프로필/로그아웃 UI

### 5.3 AppShell 변경
- 비로그인: "로그인" 버튼 → `/login`으로 이동
- 로그인: 닉네임 + 카카오 프로필 이미지 + "로그아웃" 버튼

---

## 6. 공유 타입 (`packages/shared`)

```typescript
export interface AuthUser {
  id: string;         // 카카오 고유 ID
  email?: string;
  nickname: string;
  profileImageUrl?: string;
}
```

---

## 7. 보안 고려사항
- JWT는 `HttpOnly` 쿠키 대신 Bearer 토큰 방식 (SPA 편의)
- JWT 만료: 7일 (`expiresIn: '7d'`)
- CORS: 백엔드에서 `FRONTEND_URL`만 허용
- 카카오 카드에 공개되지 않는 이메일은 optional 처리

---

## 8. 작업 순서
1. 공유 타입에 `AuthUser` 추가
2. 백엔드 패키지 설치 + `.env.example` 작성
3. `AuthModule` 구현 (strategy → service → controller → module)
4. `AppModule`에 AuthModule 등록
5. 프론트엔드 `useAuthStore` 구현
6. `LoginPage`, `KakaoCallbackPage` 구현
7. `api.ts` fetchJson Bearer 토큰 주입
8. `App.tsx` 라우트 추가
9. `AppShell.tsx` 로그인 상태 UI
10. 커밋 & 푸시
