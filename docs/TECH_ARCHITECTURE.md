# 기술 아키텍처 초안: Bunyang Flow

## 1. 기술 방향

- 프론트엔드: React + TypeScript
- 백엔드: NestJS + TypeScript
- 배포 환경: AWS
- 개발 환경: Local first

## 2. 아키텍처 목표

- 로컬에서 빠르게 개발하고, AWS에 안정적으로 배포할 수 있어야 한다.
- 프론트와 백엔드를 TypeScript로 통일해 생산성과 유지보수성을 높인다.
- 분양 단계, 일정, 알림처럼 상태 변화가 많은 도메인을 백엔드 중심으로 관리한다.
- 초기 MVP는 단순하게 시작하되, 이후 관리자 기능과 데이터 수집 기능을 붙이기 쉬운 구조여야 한다.

## 3. 권장 프로젝트 구조

### 추천 방식
- 모노레포

### 이유
- 프론트와 백엔드 모두 TypeScript를 사용하므로 타입 공유가 쉽다.
- API DTO, enum, stage 상수 등을 공용 패키지로 분리할 수 있다.
- 로컬 개발, 빌드, 배포 파이프라인을 한 저장소에서 관리하기 좋다.

### 예시 구조

```text
/apps
  /web         -> React 앱
  /api         -> NestJS 앱
/packages
  /shared      -> 공통 타입, enum, 유틸
  /ui          -> 공통 UI 토큰/컴포넌트(선택)
/infra
  /docker      -> 로컬 개발용 설정
  /aws         -> 배포 관련 IaC 또는 스크립트
```

## 4. 프론트엔드 설계

### 기술 선택
- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand 또는 Context 기반 경량 상태관리

### 선택 이유
- Vite는 로컬 개발 속도가 빠르고 설정이 단순하다.
- 이 서비스는 복잡한 대시보드형 상호작용이 많아 CSR 구조가 MVP에 적합하다.
- 서버 상태는 TanStack Query로 관리하면 리스트, 상세, 일정, 관심 단지 캐싱이 편하다.

### 프론트 주요 책임
- 홈, 리스트, 상세, 일정, 관심, 마이 화면 렌더링
- 필터 상태 관리
- 사용자 조건 입력 및 저장
- API 데이터 조회 및 캐싱
- 알림 설정, 관심 저장, 비교함 액션 처리

### 화면 구조 제안
- `/` (홈)
- `/onboarding` (온보딩)
- `/offerings` (분양 찾기 - 리스트 뷰)
- `/offerings/map` (분양 찾기 - 지도 뷰)
- `/offerings/:id` (단지 상세)
- `/eligibility` (청약 자격 진단)
- `/score` (가점 계산기)
- `/saved` (관심 단지)
- `/schedule` (일정 캘린더)
- `/me` (마이페이지)

### 상태 분리 원칙
- 서버 데이터: TanStack Query
- UI 상태: 모달, 필터 열림 여부, 임시 정렬값 등
- 사용자 조건: 로그인 전에는 localStorage, 로그인 후에는 서버 동기화

## 5. 백엔드 설계

### 기술 선택
- NestJS
- TypeScript
- REST API 우선
- Prisma + PostgreSQL
- class-validator / class-transformer

### 선택 이유
- NestJS는 모듈 구조가 명확해서 도메인 분리가 쉽다.
- Prisma는 TypeScript 환경에서 생산성이 높고, 스키마 관리가 직관적이다.
- MVP 단계에서는 GraphQL보다 REST가 단순하고 빠르게 만들기 좋다.

### 권장 모듈 구조

```text
/apps/api/src
  /modules
    /auth
    /users
    /offerings
    /complexes
    /schedule
    /eligibility
    /interests
    /alerts
    /admin
  /common
  /config
  /database
```

### 핵심 도메인 모듈
- `offerings`: 분양 공고 목록, 상세, 단계 필터
- `complexes`: 단지 기본 정보
- `schedule`: 일정 이벤트, 단계 계산
- `eligibility`: 청약 자격 간이 판단
- `score`: 가점 계산
- `competition`: 경쟁률 데이터
- `regulation`: 규제 정보
- `interests`: 관심 단지 저장
- `alerts`: 일정 알림 설정
- `collector`: 데이터 수집/갱신 (배치)
- `admin`: 관리자용 데이터 입력/수정

### API 스타일
- `GET /offerings` (필터: stage, region, price, area, supply_type 등)
- `GET /offerings/:id`
- `GET /offerings/:id/competition` (경쟁률 데이터)
- `GET /offerings/:id/regulation` (규제 정보)
- `GET /offerings/map` (bounding box 기반 지도 조회)
- `GET /schedule`
- `POST /eligibility/check`
- `POST /score/calculate` (가점 계산)
- `GET /score/me` (저장된 가점)
- `POST /interests`
- `DELETE /interests/:offeringId`
- `POST /alerts`
- `PATCH /users/profile`
- `GET /competition/region-stats` (지역별 경쟁률 통계)

## 6. 데이터베이스 설계

### 권장 DB
- PostgreSQL

### 이유
- 관계형 데이터 구조가 분명하다.
- 분양 공고, 일정, 공급 유형, 사용자 조건 간 관계를 다루기에 적합하다.
- AWS RDS로 운영하기 쉽다.

### ORM
- Prisma

### MVP 핵심 테이블
- complex
- housing_offering
- housing_type
- schedule_event
- supply_rule
- user_profile
- user_interest
- user_alert

## 7. 인증/권한

### MVP 권장 방식
- 이메일 로그인 또는 소셜 로그인 중 하나로 시작
- JWT 기반 인증
- Refresh token은 HttpOnly cookie 또는 별도 안전 저장 방식 사용

### 권한 구분
- guest
- user
- admin

### 메모
- 로그인 없이도 리스트/상세 조회는 가능하게 두고,
- 관심 저장, 일정 알림, 조건 저장부터 로그인 요구가 자연스럽다.

## 8. AWS 인프라 제안

### 프론트엔드
- S3 + CloudFront

### 백엔드
- ECS Fargate 또는 EC2 기반 Docker 배포

### DB
- RDS PostgreSQL

### 파일/문서
- S3

### 비밀값 관리
- AWS Systems Manager Parameter Store 또는 Secrets Manager

### 로그/모니터링
- CloudWatch Logs
- CloudWatch Alarm

### 도메인/HTTPS
- Route 53
- ACM

## 9. AWS 구성 추천안

### MVP에 가장 현실적인 조합
- Web: S3 + CloudFront
- API: ECS Fargate
- DB: RDS PostgreSQL
- Reverse proxy 또는 ALB: Application Load Balancer

### 이유
- React 웹은 정적 배포가 가장 단순하고 비용 효율적이다.
- Nest API는 컨테이너화해 ECS Fargate로 운영하면 서버 관리 부담이 적다.
- 추후 관리자 페이지, 배치, 워커를 같은 AWS 계정 안에서 확장하기 쉽다.

## 10. 로컬 개발 환경

### 권장 구성
- web: `localhost:5173`
- api: `localhost:4000`
- db: Docker PostgreSQL

### 로컬 개발 방식
- 프론트는 Vite dev server 사용
- 백엔드는 Nest dev server 사용
- 데이터베이스만 Docker로 띄우는 방식 권장

### 예시 구성

```text
/apps/web
/apps/api
/docker-compose.yml
/.env
/.env.local
```

### 로컬 개발 원칙
- DB와 외부 의존성만 Docker로 관리한다.
- 앱 서버는 로컬 프로세스로 실행해 디버깅 속도를 높인다.
- 환경변수는 앱별로 분리한다.

## 11. 배포 전략

### 환경 분리
- local
- dev
- prod

### 권장 흐름
1. 로컬 개발
2. dev AWS 배포
3. QA 확인
4. prod 배포

### CI/CD 추천
- GitHub Actions

### 배포 예시
- web: 빌드 후 S3 업로드, CloudFront invalidation
- api: Docker image build 후 ECR push, ECS service update

## 12. 데이터 수집 아키텍처

### 수집 대상
- 청약홈 (한국부동산원): 분양 공고, 일정, 경쟁률, 당첨 가점
- 국토교통부 실거래가 공개시스템: 분양가 참고 데이터
- 각 시/도 분양 공고: 공공분양 정보

### 수집 방식
- 공공 API 우선 활용 (청약홈 Open API, 공공데이터포털)
- API 미제공 데이터는 스크래핑 (Puppeteer / Playwright)
- 관리자 수동 입력 보조 (공고문 비정형 데이터)

### 수집 주기
- 분양 공고: 1일 1~2회
- 경쟁률 (접수 기간): 1시간~실시간 (후속 확장)
- 규제 정보: 정책 변경 시 수동 + 주기적 검증

### 수집 파이프라인 구조
```text
[Scheduler (cron)] → [Collector Worker] → [Parser] → [Validator] → [DB Writer]
                                                                        ↓
                                                               [Change Detector]
                                                                        ↓
                                                             [Notification Trigger]
```

### 데이터 검증
- 수집 후 기존 데이터와 diff 비교
- 변경 감지 시 data_checked_at 갱신
- 비정상 데이터는 관리자 리뷰 큐에 추가

### 메모
- 청약홈 데이터 이용 정책 및 크롤링 허용 범위를 사전 확인해야 한다.
- 초기에는 수도권 + 주요 광역시 중심으로 수집 범위를 제한한다.
- 수집 실패 시 재시도 로직과 알림을 갖춰야 한다.

## 13. 알림 및 배치 처리

### 필요한 기능
- 분양 일정 알림
- 분양 단계 갱신
- 외부 데이터 수집/갱신

### MVP 권장 방식
- NestJS cron 또는 별도 배치 프로세스

### 확장 시 고려
- SQS
- EventBridge Scheduler
- BullMQ + Redis

### 메모
- 처음부터 큐 기반으로 과하게 가지 말고,
- 일정 갱신과 알림 발송이 많아질 때 워커를 분리하는 편이 적절하다.

## 14. 지도 서비스 연동

### 권장 옵션
- Kakao Map API (국내 데이터 정확도, 한글 지원, 무료 티어 제공)

### 대안
- Naver Map API (네이버 생태계 연동 시)
- Google Maps (글로벌 확장 고려 시)

### 연동 방식
- 프론트엔드에서 직접 Map SDK 로드
- 단지 좌표는 백엔드에서 제공 (complex 테이블의 latitude/longitude)
- 마커 클러스터링은 프론트에서 처리
- 지도 영역 변경 시 백엔드에 bounding box 쿼리

### 주의사항
- API 호출량 관리 (무료 티어 일일 한도 확인)
- 지도 SDK 로딩 성능 최적화 (lazy loading)
- 모바일에서 지도 인터랙션 성능 테스트 필요

## 15. SEO 및 초기 유입 전략

### 현재 구조 한계
- Vite + React CSR 구조는 SEO가 약함

### 권장 대응
- MVP 단계: 분양 단지 상세 페이지에 대한 prerender 또는 SSR 부분 적용 검토
- 방법 1: React + Vite 유지 + prerender.io 또는 서버 사이드 prerender 서비스 사용
- 방법 2: 향후 Next.js 전환 검토 (SSR/SSG 네이티브 지원)

### SEO 핵심 페이지
- 단지 상세 페이지 (`/offerings/:id`)
- 지역별 분양 리스트 (`/offerings?region=서울`)
- 이 페이지들은 검색 엔진에서 유입이 발생할 핵심 페이지

### 최소 대응
- 메타 태그 (title, description, og:image) 동적 생성
- sitemap.xml 자동 생성
- robots.txt 설정
- 구조화된 데이터 (JSON-LD) 적용 (분양 단지 정보)

## 16. 캐싱 전략

### 서버 캐싱
- 분양 리스트 API: Redis 기반 쿼리 결과 캐싱 (TTL 5~10분)
- 단지 상세 API: Redis 캐싱 (TTL 30분, 데이터 갱신 시 invalidation)
- 홈 섹션 API: Redis 캐싱 (TTL 10분)
- 경쟁률 데이터: 접수 중 단지는 짧은 TTL (5분), 마감 단지는 긴 TTL (24시간)

### 클라이언트 캐싱
- TanStack Query의 staleTime/cacheTime 적절히 설정
- 리스트: staleTime 5분
- 상세: staleTime 10분
- 사용자 프로필: staleTime 30분
- 관심 단지: staleTime 1분 (변경이 잦으므로)

### CDN 캐싱
- 정적 자산: CloudFront 캐싱 (max-age 1년, 빌드 해시 기반)
- API 응답: 캐싱하지 않음 (데이터 최신성 중요)

## 17. 모니터링 및 에러 추적

### 에러 추적
- Sentry (프론트엔드 + 백엔드)
- 사용자 세션 리플레이 (Sentry Session Replay 또는 LogRocket) - 후속 확장

### 성능 모니터링
- CloudWatch 메트릭 (API 응답 시간, 에러율, CPU/메모리)
- 커스텀 메트릭: 필터 사용률, 가점 계산 완료율, 지도 뷰 전환율

### 알림
- CloudWatch Alarm → SNS → Slack/Email
- 조건: API 에러율 5% 초과, 응답 시간 2초 초과, 데이터 수집 실패

### 분석
- Google Analytics 4 또는 Mixpanel (사용자 행동 분석)
- 핵심 이벤트: 필터 사용, 상세 조회, 관심 저장, 가점 계산, 알림 설정

## 18. 보안/운영 체크포인트

- CORS 정책 명확화
- 관리자 API 별도 권한 분리
- 공고 데이터 변경 이력 추적 고려
- 개인정보 최소 수집 원칙 적용
- 로그에 민감정보 저장 금지
- Rate Limiting: API 호출 제한 (인증 사용자 100req/min, 비인증 30req/min)
- 스크래핑 방어: 비정상 패턴 감지 및 차단

## 14. MVP 기준 최종 추천 스택

### 프론트
- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- Kakao Map SDK (지도)

### 백엔드
- NestJS
- TypeScript
- Prisma
- PostgreSQL
- Redis (캐싱)
- Sentry (에러 추적)

### 인프라
- AWS S3
- AWS CloudFront
- AWS ECS Fargate
- AWS RDS PostgreSQL
- AWS ElastiCache Redis
- AWS CloudWatch
- AWS ECR

### 데이터 수집
- Playwright 또는 Puppeteer (스크래핑)
- NestJS cron (스케줄링)

### 모니터링/분석
- Sentry (에러 추적)
- Google Analytics 4 (사용자 분석)

### 협업/배포
- GitHub
- GitHub Actions

## 19. 다음 단계 제안

1. 모노레포 폴더 구조를 실제로 생성
2. API 명세 초안 작성 (경쟁률, 규제, 가점, 지도 API 포함)
3. Prisma 스키마 초안 작성 (regulation_info, competition_rate, user_score 포함)
4. 지도 서비스 API 키 발급 및 프로토타입
5. 데이터 수집 파이프라인 PoC (청약홈 데이터)
6. AWS 배포 구조를 `docker-compose`와 `Dockerfile` 기준으로 정리
7. SEO 대응 방안 확정 (prerender vs Next.js 전환)

