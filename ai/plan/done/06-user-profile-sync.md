# [06] 로그인 후 사용자 프로필 서버 동기화

## 작업 목표
비로그인 상태에서 localStorage에 저장한 온보딩 조건(지역, 예산, 무주택 여부 등)을 로그인 시 서버에 동기화한다.
로그인 이후 조건 변경도 서버에 반영되어 API 기반 추천이 가능하게 한다.

## 참고 문서
- `docs/CLAUDE.md` — UserProfile 엔티티, 비로그인 → 로그인 동기화 흐름
- `docs/SCREEN_SPEC.md` — 5.0 온보딩, 5.10 마이페이지
- `docs/DATA_MODEL.md` — user_profile 필드 정의

## 선행 작업
- [01] Prisma DB 설정 완료 필요
- [05] JWT Refresh Token 완료 권장

## 영향 범위
- `apps/api/src/modules/users/` — 신규 모듈 (UserProfile CRUD)
- `apps/web/src/store/preferences.ts` — syncProfile() 액션 추가
- `apps/web/src/pages/KakaoCallbackPage.tsx` — 로그인 완료 후 동기화 호출
- `apps/web/src/pages/ProfilePage.tsx` — 로그인 시 서버 데이터 로드

## 구현 단계

### 1. Users 모듈 (API)
```
GET   /users/me/profile   — 내 프로필 조회
PUT   /users/me/profile   — 프로필 전체 저장/업데이트
PATCH /users/me/profile   — 부분 수정
```
- UserProfile이 없으면 upsert 처리
- `JwtAuthGuard` 적용

### 2. UserProfile 스키마 필드
CLAUDE.md 기준:
- residenceRegion1, residenceRegion2 (관심 지역)
- isHomeless (무주택 여부)
- isHouseholdHead (세대주 여부)
- hasSubscriptionAccount (청약통장 보유)
- subscriptionPeriodYears (가입 기간)
- specialSupplyFlags (특별공급 대상: newlywed | first_time_buyer | multi_child | elder_support)
- budgetMin, budgetMax (예산 범위)

### 3. 프론트엔드 동기화 흐름
`KakaoCallbackPage` 로그인 성공 후:
1. `GET /users/me/profile` 호출
2. 서버에 프로필 있으면 → Zustand store 덮어쓰기 (서버 우선)
3. 서버에 프로필 없으면 → 로컬 store 데이터를 `PUT /users/me/profile`로 업로드
4. 이후 `ProfilePage`에서 수정 시 `PATCH /users/me/profile` 호출

### 4. ProfilePage 업데이트
- 로그인 상태일 때 `GET /users/me/profile`로 초기 데이터 로드
- 수정 폼 저장 시 API 호출
- 비로그인 상태는 기존 localStorage 방식 유지

## 리스크 / 가정
- 서버 데이터가 로컬보다 최신일 수 있으므로 충돌 시 서버 우선 정책 적용
- 로컬에 데이터가 없고 서버에도 없는 경우 온보딩으로 유도

## 완료 조건
- 로그인 시 로컬 조건이 서버에 저장됨
- 다른 기기에서 로그인 시 동일한 조건으로 추천 단지 노출
- ProfilePage에서 수정 시 서버에 즉시 반영
