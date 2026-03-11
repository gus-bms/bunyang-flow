# [04] Interests / Alerts API 모듈 구현

## 작업 목표
현재 localStorage(Zustand)에만 저장되는 관심 단지·알림 설정을 서버에도 저장·동기화한다.
로그인 사용자는 기기 간 데이터가 동기화되고, 비로그인 사용자는 기존 localStorage 방식 유지.

## 참고 문서
- `docs/CLAUDE.md` — interests, alerts 모듈, API 엔드포인트 명세
- `docs/SCREEN_SPEC.md` — 5.6 관심 단지, 5.9 알림 설정
- `docs/DATA_MODEL.md` — UserInterest, UserAlert 엔티티

## 선행 작업
- [01] Prisma DB 설정 완료 필요

## 영향 범위
- `apps/api/src/modules/interests/` — 신규 모듈
- `apps/api/src/modules/alerts/` — 신규 모듈
- `apps/api/src/app.module.ts` — 모듈 등록
- `apps/web/src/lib/api.ts` — 클라이언트 함수 추가
- `apps/web/src/store/preferences.ts` — 로그인 시 서버 동기화 로직 추가

## 구현 단계

### 1. Interests 모듈 (API)
```
POST   /interests              — 관심 단지 추가 (offeringId)
DELETE /interests/:offeringId  — 관심 단지 제거
GET    /interests              — 내 관심 단지 목록
```
- `JwtAuthGuard` 적용 (인증 필수)
- UserInterest 테이블에 userId + offeringId unique 제약

### 2. Alerts 모듈 (API)
```
POST   /alerts                 — 알림 설정 등록 (offeringId, eventTypes[])
DELETE /alerts/:offeringId     — 알림 해제
GET    /alerts                 — 내 알림 설정 목록
PATCH  /alerts/:offeringId     — 알림 항목 수정
```
- `JwtAuthGuard` 적용
- UserAlert 테이블에 알림 유형(announcement, special_supply, priority_1 등) 배열 저장

### 3. 프론트엔드 — 로그인 시 동기화
`apps/web/src/store/preferences.ts`에 `syncToServer()` 액션 추가:
1. 로그인 완료 시 `KakaoCallbackPage`에서 호출
2. localStorage의 `savedOfferingIds` → `POST /interests` 일괄 전송
3. localStorage의 `alertedOfferingIds` → `POST /alerts` 일괄 전송
4. 이후 관심 저장/해제, 알림 토글은 API 호출과 localStorage를 동시에 처리

### 4. 비로그인 → 로그인 전환 흐름
- 비로그인: Zustand localStorage만
- 로그인 후: API 호출 + Zustand 동기화
- 이미 서버에 있는 항목은 중복 추가하지 않도록 upsert 처리

## 리스크 / 가정
- 비로그인 상태의 관심 단지는 서버에 저장하지 않음 (기존 동작 유지)
- 로그인 동기화 실패 시 localStorage 데이터는 보존, 재시도 안내

## 완료 조건
- 로그인 사용자의 관심 단지가 서버에 저장됨
- 다른 기기에서 로그인 시 동일한 관심 단지 목록 확인
- 비로그인 사용자는 기존 localStorage 동작 유지
- 로그인 시 localStorage 데이터가 서버로 동기화됨
