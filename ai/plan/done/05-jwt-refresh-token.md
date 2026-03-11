# [05] JWT Refresh Token 구현

## 작업 목표
현재 access token만 발급하는 인증 방식을 refresh token 기반으로 보완한다.
refresh token은 HttpOnly cookie에 저장해 XSS 공격에 안전하게 관리한다.

## 참고 문서
- `docs/CLAUDE.md` — JWT auth with HttpOnly cookie for refresh tokens; guest/user/admin roles
- `docs/TECH_ARCHITECTURE.md` — 인증 설계

## 영향 범위
- `apps/api/src/modules/auth/` — auth.service, auth.controller 수정
- `apps/api/src/modules/auth/strategies/` — jwt-refresh.strategy.ts 추가
- `apps/web/src/store/auth.ts` — silent refresh 로직 추가
- `apps/web/src/lib/api.ts` — 401 응답 시 refresh 재시도 인터셉터

## 구현 단계

### 1. Refresh Token 발급 (API)
- 로그인 성공 시 access token(15분) + refresh token(7일) 발급
- refresh token은 `Set-Cookie: refresh_token=...; HttpOnly; SameSite=Strict` 응답 헤더로 전달
- DB에 refresh token 해시 저장 (UserRefreshToken 테이블 또는 User 필드)

### 2. Refresh 엔드포인트
```
POST /auth/refresh  — cookie의 refresh_token으로 새 access token 발급
POST /auth/logout   — refresh_token cookie 삭제, DB에서 토큰 무효화
```

### 3. JWT Refresh Strategy
`apps/api/src/modules/auth/strategies/jwt-refresh.strategy.ts`
- cookie에서 refresh token 추출
- DB에서 유효성 검증
- 새 access token 반환

### 4. 프론트엔드 Silent Refresh
`apps/web/src/lib/api.ts` axios/fetch 인터셉터:
- 401 응답 → `POST /auth/refresh` 호출 → 새 access token으로 원래 요청 재시도
- refresh도 실패하면 로그아웃 처리 후 `/login` 리다이렉트

### 5. 로그아웃 처리
- `POST /auth/logout` 호출로 서버 토큰 무효화
- Zustand auth store 초기화

## 리스크 / 가정
- SameSite=Strict으로 설정하면 카카오 OAuth 리다이렉트 후 cookie가 전달되지 않을 수 있음 → SameSite=Lax 검토 필요
- 개발 환경(localhost)에서 cookie Secure 속성 처리 필요

## 완료 조건
- access token 만료 후 자동으로 refresh되어 사용자가 로그아웃되지 않음
- 로그아웃 시 서버 refresh token이 무효화됨
- HttpOnly cookie로 refresh token 저장 확인
