# 작업 로그 — 데이터 수집 파이프라인 (Task 02)

## 실제 변경 사항

### API (apps/api)
- `package.json` — `@nestjs/schedule` 의존성 추가
- `src/modules/collector/adapters/apihome.adapter.ts` — 신규: 청약홈 Open API 어댑터 (API 키 없으면 빈 배열 반환)
- `src/modules/collector/pipeline/validator.ts` — 신규: 필수 필드 검증
- `src/modules/collector/pipeline/db-writer.ts` — 신규: Prisma upsert 처리
- `src/modules/collector/pipeline/change-detector.ts` — 신규: DB 비교 기반 변경 감지
- `src/modules/collector/collector.service.ts` — 신규: NestJS Cron 스케줄러 + 파이프라인 실행 (최대 3회 재시도, exponential backoff)
- `src/modules/collector/collector.module.ts` — 신규
- `src/modules/admin/admin.service.ts` — 신규: 수동 공고 등록/수정, 수집 트리거
- `src/modules/admin/admin.controller.ts` — 신규: POST/PATCH /admin/offerings, POST /admin/collect, POST /admin/seed (admin role 필요)
- `src/modules/admin/admin.module.ts` — 신규
- `src/app.module.ts` — NestScheduleModule.forRoot(), CollectorModule, AdminModule 등록

## 주요 결정 사항

- APIHOME_SERVICE_KEY 없을 때: 어댑터가 빈 배열 반환 → 파이프라인 구조 검증 가능, 실제 수집은 하지 않음
- Admin 권한 체크: JWT payload의 role 클레임으로 간이 확인 (추후 DB 검증으로 강화 필요)
- 알림 트리거: 변경 감지 후 로그만 기록 (Task 10에서 실제 발송 구현)
- 경쟁률 수집: 매시간 Cron 등록 완료, 실제 호출 로직은 TODO로 남김

## 수집 스케줄

| 종류 | 주기 |
|------|------|
| 공고 | 매일 03:00, 12:00 |
| 경쟁률 | 매시간 |

## 후속 이슈

- 환경변수 `APIHOME_SERVICE_KEY` 발급 후 `apihome.adapter.ts` 실제 구현 필요
- 청약홈 Open API 정책 및 데이터 사용 라이선스 확인 필요
- Admin role 클레임을 JWT에 포함시키는 로직 추가 필요 (현재 기본값 'user'로 발급됨)
- Playwright 스크래퍼: API 부족 항목 보완 용도 (추후 `scraper.adapter.ts` 추가)
