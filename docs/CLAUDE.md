# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bunyang Flow (분양 플로우)** — A Korean real estate service focused exclusively on 분양 (new housing sales/subscriptions) and 청약 (housing subscription applications). The service intentionally excludes 매매/전월세 (resale/rental) information.

This repository currently contains only planning documents. No code has been written yet. The planning documents are:
- `PRD.md` — Product requirements, user scenarios, feature specs
- `TECH_ARCHITECTURE.md` — Tech stack decisions, infra design, local dev setup
- `DATA_MODEL.md` — Entity definitions, relationships, field-level details
- `SCREEN_SPEC.md` — Screen-by-screen UX spec and component definitions
- `WIREFRAMES.md` — Mobile-first wireframes for all MVP screens

## Planned Tech Stack

### Monorepo Structure
```
/apps/web       → React app (Vite, localhost:5173)
/apps/api       → NestJS app (localhost:4000)
/packages/shared → Shared types, enums, utils
/packages/ui    → Shared UI tokens/components (optional)
/infra/docker   → Local dev config
/infra/aws      → Deployment IaC/scripts
docker-compose.yml  → PostgreSQL only (apps run as local processes)
```

### Frontend (`/apps/web`)
- React + TypeScript + Vite
- React Router for routing
- TanStack Query for server state (staleTime: list=5min, detail=10min, profile=30min, interests=1min)
- Zustand for UI/client state
- Kakao Map SDK for map view
- Non-authenticated users: store conditions in localStorage, sync to server on login

### Backend (`/apps/api`)
- NestJS + TypeScript + REST API
- Prisma + PostgreSQL
- Redis for caching (list TTL=5–10min, detail=30min, home sections=10min)
- Rate limiting: 100 req/min (authenticated), 30 req/min (unauthenticated)
- JWT auth with HttpOnly cookie for refresh tokens; guest/user/admin roles

### Infrastructure (AWS)
- Frontend: S3 + CloudFront
- Backend: ECS Fargate + ALB
- DB: RDS PostgreSQL
- Cache: ElastiCache Redis
- CI/CD: GitHub Actions
- Error tracking: Sentry (both frontend and backend)
- Analytics: Google Analytics 4

## Domain Model

### Core Entities and Relationships
```
complex (단지)
  └─ 1:N housing_offering (분양 공고)
          ├─ 1:N housing_type (타입별 공급/분양가)
          ├─ 1:N schedule_event (일정 이벤트)
          ├─ 1:N supply_rule (공급 유형별 자격)
          ├─ 1:1 regulation_info (규제 정보)
          └─ 1:N competition_rate (경쟁률/당첨가점)

user
  ├─ 1:1 user_profile (조건: 무주택, 거주지, 청약통장 등)
  ├─ 1:1 user_score (청약 가점: 0~84점)
  ├─ 1:N user_interest (관심 단지)
  ├─ 1:N user_alert (일정 알림 설정)
  └─ 1:N complex_comparison (비교함)
```

### `housing_offering.current_stage` Enum (8 stages)
`planned` → `announcement_open` → `special_supply_open` → `priority_1_open` → `priority_2_open` → `winner_announced` → `contract_open` → `move_in_pending` → `closed`

Stage is auto-calculated from `schedule_event` dates but can be manually overridden.

### `schedule_event.event_type` Enum
`announcement` | `special_supply` | `priority_1` | `priority_2` | `winner_announcement` | `contract` | `move_in`

### `regulation_info` Key Fields
`price_cap_applied` | `resale_restriction_months` | `residency_obligation_months` | `rewin_restriction_years` | `speculation_zone_type` | `interim_loan_available`

### User Score Breakdown (84점 만점)
- 무주택 기간: 0–32점
- 부양가족 수: 0–35점
- 청약통장 가입 기간: 0–17점

## Frontend Routes
```
/               → 홈
/onboarding     → 온보딩 (5단계, all skippable)
/offerings      → 분양 찾기 (리스트 뷰)
/offerings/map  → 분양 찾기 (지도 뷰)
/offerings/:id  → 단지 상세 (SEO priority page)
/eligibility    → 청약 자격 진단
/score          → 청약 가점 계산기
/saved          → 관심 단지
/schedule       → 일정 캘린더
/me             → 마이페이지
```

## Backend Module Structure
```
/apps/api/src/modules/
  offerings    → 분양 공고 목록/상세/단계 필터 (core)
  complexes    → 단지 기본 정보
  schedule     → 일정 이벤트, 단계 계산
  eligibility  → 청약 자격 간이 판단
  score        → 가점 계산 (규정 변경 대응 필요)
  competition  → 경쟁률 데이터
  regulation   → 규제 정보
  interests    → 관심 단지 저장
  alerts       → 일정 알림 설정
  collector    → 데이터 수집/갱신 배치 (청약홈 API + Playwright)
  admin        → 관리자 데이터 입력/수정
  auth / users
```

## Key API Endpoints (Planned)
```
GET  /offerings                        # filter: stage, region, price, area, supply_type
GET  /offerings/:id
GET  /offerings/:id/competition
GET  /offerings/:id/regulation
GET  /offerings/map                    # bounding box query
GET  /schedule
POST /eligibility/check
POST /score/calculate
GET  /score/me
POST /interests
DELETE /interests/:offeringId
POST /alerts
GET  /competition/region-stats
```

## Data Collection Pipeline
Data sourced from 청약홈 (한국부동산원) Open API + Playwright scraping + manual admin input. Collection schedule: offerings 1–2x/day, competition rates hourly during open periods. Pipeline: `[Scheduler] → [Collector] → [Parser] → [Validator] → [DB Writer] → [Change Detector] → [Notification Trigger]`. Collect failures must retry and alert.

## Key Business Rules
- Offerings with `current_stage` in `{special_supply_open, priority_1_open, priority_2_open}` are "지금 청약 가능" (actionable now)
- 가점제 vs 추첨제 ratio differs by area: 85㎡ 이하 may have up to 100% 가점제
- Supply types with special eligibility: `newlywed` | `first_time_buyer` | `multi_child` | `elder_support` | `institution_recommendation`
- All eligibility diagnosis results are advisory only (참고 정보), not legal determinations
- Financial simulation values (loan rates, etc.) must be labeled as reference estimates

## Open Architecture Decisions
- Map SDK: Kakao Map preferred (Korean data accuracy), Naver/Google as alternatives
- SEO: Current CSR (Vite) is weak for SEO; decision pending between prerender service vs Next.js migration for `/offerings/:id` and `/offerings?region=*`
- 청약홈 data scraping license/policy must be confirmed before implementation
- Queue system (BullMQ/SQS) deferred until alert/batch volume warrants it
