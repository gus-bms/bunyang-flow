# 작업 로그 — Prisma DB 설정 (Task 01)

## 실제 변경 사항

- `apps/api/package.json` — prisma, @prisma/client 의존성 추가
- `apps/api/prisma/schema.prisma` — 전체 엔티티 스키마 작성 (HousingOffering, HousingType, ScheduleEvent, SupplyRule, RegulationInfo, CompetitionRate, User, UserProfile, UserScore, UserInterest, UserAlert)
- `apps/api/prisma/migrations/20260310122408_init/` — 초기 마이그레이션 생성 및 적용
- `apps/api/prisma/seed.ts` — mock-data.ts 기반 시드 스크립트 작성
- `apps/api/src/prisma/prisma.service.ts` — PrismaService (OnModuleInit 포함)
- `apps/api/src/prisma/prisma.module.ts` — PrismaModule 글로벌 등록
- `apps/api/src/app.module.ts` — PrismaModule import 추가
- `apps/api/src/modules/offerings/offerings.service.ts` — mock 데이터 제거, Prisma 쿼리로 전환
- `apps/api/src/modules/schedule/schedule.service.ts` — Prisma 기반으로 전환
- `apps/api/src/modules/auth/auth.service.ts` — 로그인 시 User upsert (Prisma)

## 주요 결정 사항

- `HousingOffering.id`를 mock ID(slug 기반)와 동일하게 유지 → 기존 프론트엔드 라우팅과 호환
- BigInt 직렬화: JSON.stringify BigInt 처리용 `serializeBigInt()` 헬퍼 사용
- ComplexComparison 엔티티는 스키마에서 생략 (프론트엔드 localStorage만 사용 중, 추후 서버 저장 필요 시 추가)

## 검증 내용

- `prisma migrate status` — up to date 확인
- `prisma db seed` — 4개 mock 공고 정상 시드 확인

## 후속 이슈

- ComplexComparison 서버 저장 필요 여부 — 현재 localStorage만 사용하므로 후순위
- minSalePrice/maxSalePrice BigInt 처리는 API 응답에서 Number로 변환 중 (정밀도 손실 없는 범위)
