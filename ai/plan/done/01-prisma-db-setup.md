# [01] DB 연동 — Prisma + PostgreSQL 설정

## 작업 목표
현재 mock-data.ts에 의존하는 API를 실제 PostgreSQL DB로 전환한다.
관심 단지·알림 설정 등 사용자 데이터를 서버에 영구 저장할 수 있게 한다.

## 참고 문서
- `docs/CLAUDE.md` — 도메인 모델, 엔티티 관계, 핵심 enum
- `docs/DATA_MODEL.md` — 필드 수준 상세 정의
- `docs/TECH_ARCHITECTURE.md` — DB 스택 결정 (PostgreSQL + Prisma)

## 영향 범위
- `apps/api` — Prisma 클라이언트 설치, schema.prisma 작성, 모듈 전체
- `packages/shared/mock-data.ts` — 시드 데이터로 재활용
- `docker-compose.yml` — PostgreSQL 컨테이너 (이미 정의됨 확인 필요)

## 구현 단계

### 1. Prisma 설치 및 초기화
```
apps/api에 prisma, @prisma/client 설치
npx prisma init
```

### 2. schema.prisma 작성
CLAUDE.md 기준 엔티티를 그대로 스키마로 변환:
- `Complex` (단지)
- `HousingOffering` (분양 공고) — currentStage enum 포함
- `HousingType` (타입별 공급/분양가)
- `ScheduleEvent` (일정 이벤트) — eventType enum
- `SupplyRule` (공급 유형별 자격)
- `RegulationInfo` (규제 정보)
- `CompetitionRate` (경쟁률/당첨가점)
- `User`
- `UserProfile` (조건: 무주택, 거주지, 청약통장 등)
- `UserScore` (가점 0~84)
- `UserInterest` (관심 단지)
- `UserAlert` (일정 알림 설정)
- `ComplexComparison` (비교함)

### 3. PrismaModule 글로벌 등록
`apps/api/src/prisma/prisma.service.ts` 작성 후 AppModule에 import

### 4. Seed 스크립트 작성
`packages/shared/mock-data.ts`의 mock 데이터를 그대로 DB seed로 변환
`apps/api/prisma/seed.ts` 작성

### 5. 기존 서비스 리팩터링
- `OfferingsService.list()` — Prisma 쿼리로 교체
- `OfferingsService.detail()` — Prisma include로 관계 데이터 포함
- `ScheduleService` — DB 기반으로 교체
- `EligibilityService` — 조건 판단 로직은 유지, DB 데이터 참조로 변경
- `ScoreService` — 계산 로직 유지, UserScore 저장 추가

### 6. 마이그레이션 실행
```
npx prisma migrate dev --name init
npx prisma db seed
```

## 리스크 / 가정
- docker-compose.yml에 PostgreSQL 서비스가 이미 정의되어 있을 것으로 가정
- mock-data의 필드와 DATA_MODEL 간 불일치가 있을 수 있으므로 확인 필요
- currentStage 자동 계산 로직은 DB 저장값 + 수동 override 방식으로 구현

## 완료 조건
- `prisma migrate dev` 에러 없이 실행
- `prisma db seed` 후 mock 데이터가 DB에 존재
- `/offerings` API가 DB 데이터를 반환
- `/offerings/:id` 상세 API가 관계 데이터 포함해 반환
