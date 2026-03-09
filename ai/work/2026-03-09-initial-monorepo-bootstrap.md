# 작업 내용

- 문서 기준 MVP 방향에 맞춰 모노레포 초기 구조를 생성했다.
- `apps/web`에 React + Vite 기반 웹 앱과 핵심 라우트를 추가했다.
- `apps/api`에 NestJS 기반 API 골격과 `offerings`, `schedule`, `eligibility`, `score` 엔드포인트를 추가했다.
- `packages/shared`에 분양 도메인 타입, enum, 목업 데이터, 가점/자격 로직을 공통화했다.
- 루트에 `package.json`, `tsconfig.base.json`, `.env.example`, `docker-compose.yml`을 추가했다.
- `.gitignore`를 정리해 계획/작업 로그와 코드베이스가 추적 가능하도록 수정했다.

# 참고 문서

- `docs/AGENTS.md`
- `docs/PRD.md`
- `docs/TECH_ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
- `docs/SCREEN_SPEC.md`
- `docs/WIREFRAMES.md`
- `docs/CLAUDE.md`

# 주요 결정 사항

- 패키지 매니저는 현재 환경 기준으로 `npm workspaces`를 사용했다.
- 실제 외부 수집/DB 대신 문서 정합성 검증이 가능한 목업 데이터를 공통 패키지에 먼저 정의했다.
- 웹은 문서에 맞춘 핵심 사용자 흐름을 우선 구현하고, 비로그인 저장 상태는 Zustand localStorage로 처리했다.
- 웹에서 공통 패키지는 `packages/shared/src`를 직접 참조하도록 설정해 workspace CommonJS 번들 이슈를 피했다.
- API는 향후 Prisma/Redis를 붙일 수 있도록 모듈 구조를 먼저 NestJS 방식으로 고정했다.

# 검증 또는 확인 내용

- `npm install` 완료
- `npm run check` 통과
- `npm run build` 통과
- `node dist/main.js`로 API 실행 후 아래 응답 확인
  - `GET /offerings`
  - `POST /score/calculate`
  - `POST /eligibility/check`

# 후속 이슈

- Prisma 스키마와 실제 PostgreSQL 연결은 아직 미구현 상태다.
- 인증, 관심 단지 서버 동기화, 알림 발송, 지도 SDK 실연동은 후속 작업이 필요하다.
- SEO 대응과 상세 페이지 SSR/프리렌더 전략은 아키텍처 문서 기준 후속 확정이 필요하다.
