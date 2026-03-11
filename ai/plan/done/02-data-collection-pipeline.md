# [02] 데이터 수집 파이프라인 — Collector 모듈

## 작업 목표
청약홈(한국부동산원) Open API + Playwright 스크래핑을 통해 실제 분양 공고 데이터를 수집하고 DB에 저장한다.
수집→파싱→검증→DB 저장→변경 감지→알림 트리거 파이프라인을 구축한다.

## 참고 문서
- `docs/CLAUDE.md` — Data Collection Pipeline 섹션, 수집 주기, 파이프라인 흐름
- `docs/TECH_ARCHITECTURE.md` — collector 모듈 위치, 배치 스케줄러

## 선행 작업
- [01] Prisma DB 설정 완료 필요

## 영향 범위
- `apps/api/src/modules/collector/` — 신규 모듈
- `apps/api/src/modules/admin/` — 수동 데이터 입력/수정 (함께 구현)
- `apps/api/src/app.module.ts` — 모듈 등록

## 구현 단계

### 1. 청약홈 Open API 연동 확인
- API 사용 정책 및 라이선스 확인 (CLAUDE.md 오픈 이슈)
- API 엔드포인트, 인증 방식, 응답 형식 파악
- API 키 환경변수 등록 (.env)

### 2. CollectorModule 구조 설계
```
apps/api/src/modules/collector/
  collector.module.ts
  collector.service.ts       — 스케줄러 진입점
  adapters/
    apihome.adapter.ts       — 청약홈 Open API 클라이언트
    scraper.adapter.ts       — Playwright 스크래퍼 (API 부족 항목 보완)
  parsers/
    offering.parser.ts       — 공고 데이터 파싱/정규화
    competition.parser.ts    — 경쟁률 데이터 파싱
  pipeline/
    validator.ts             — 필수 필드, 날짜 형식 검증
    db-writer.ts             — Prisma upsert 처리
    change-detector.ts       — 기존 DB 데이터와 비교, 변경 감지
    notification-trigger.ts  — 변경 시 알림 큐에 적재 (초기엔 로그)
```

### 3. 스케줄러 설정
- NestJS `@nestjs/schedule` 패키지 활용
- 공고 수집: 1~2회/일 (새벽 3시, 낮 12시)
- 경쟁률 수집: 접수 기간 중 매시간
- 실패 시 재시도 로직 (최대 3회, exponential backoff)

### 4. Admin 모듈 (간이)
수집이 불완전한 데이터를 수동으로 입력/수정할 수 있는 내부 API
```
POST /admin/offerings       — 공고 수동 등록
PATCH /admin/offerings/:id  — 공고 수정
POST /admin/seed            — 시드 데이터 재적재 (개발용)
```
Admin 가드: role = 'admin' JWT 클레임 확인

### 5. 파이프라인 실행 흐름
```
[Scheduler] → [Adapter] → [Parser] → [Validator]
           → [DB Writer (upsert)] → [Change Detector]
           → [Notification Trigger]
```

## 리스크 / 가정
- 청약홈 API 정책 확인 전까지는 mock 데이터로 파이프라인 구조만 검증
- Playwright 스크래핑은 청약홈 HTML 구조 변경에 취약 → 어댑터 패턴으로 교체 가능하게 설계
- 큐 시스템(BullMQ/SQS)은 볼륨이 커지면 도입 (CLAUDE.md 오픈 결정 사항)

## 완료 조건
- 스케줄러가 설정된 시간에 수집을 실행
- 수집 데이터가 DB에 upsert 저장
- 실패 시 에러 로그 + 재시도 동작
- Admin API로 수동 데이터 입력 가능
