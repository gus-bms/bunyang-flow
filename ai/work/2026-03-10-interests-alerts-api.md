# 작업 로그 — Interests / Alerts API 모듈 (Task 04)

## 실제 변경 사항

### API (apps/api)
- `src/modules/interests/interests.service.ts` — 신규: list/add/remove 구현 (Prisma)
- `src/modules/interests/interests.controller.ts` — 신규: GET/POST/DELETE /interests, JwtAuthGuard 적용
- `src/modules/interests/interests.module.ts` — 신규
- `src/modules/alerts/alerts.service.ts` — 신규: list/upsert/update/remove 구현 (Prisma)
- `src/modules/alerts/alerts.controller.ts` — 신규: GET/POST/PATCH/DELETE /alerts, JwtAuthGuard 적용
- `src/modules/alerts/alerts.module.ts` — 신규
- `src/app.module.ts` — InterestsModule, AlertsModule 등록

### Frontend (apps/web)
- `src/lib/api.ts` — getInterests/addInterest/removeInterest/getAlerts/addAlert/updateAlert/removeAlert 추가
- `src/store/preferences.ts` — syncToServer() 액션 추가 (로그인 시 localStorage → 서버 동기화)
- `src/pages/KakaoCallbackPage.tsx` — 로그인 성공 후 syncToServer() 호출

## 주요 결정 사항

- Alerts POST는 upsert 처리: 이미 존재하면 eventTypes만 갱신 (중복 등록 방지)
- syncToServer 실패는 조용히 무시: localStorage 데이터가 보존되므로 사용자 영향 없음
- alertedOfferingIds 동기화 시 eventTypes를 빈 배열로 전송 (어떤 이벤트를 알림받을지 미정 상태)

## 검증 내용

- `tsc --noEmit` API, Web 모두 에러 없음

## 후속 이슈

- GET /interests 결과를 `SavedPage`에서 서버 데이터로 교체할 수 있음 (현재 localStorage 기반 유지)
- GET /alerts 결과를 `AlertsPage`에서 서버 데이터로 교체할 수 있음
- alertedOfferingIds 동기화 시 eventTypes를 구체적으로 매핑하려면 alert 설정 UI 필요 (Task 10 연계)
