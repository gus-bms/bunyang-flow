# 작업 목표

- 기획 문서에 맞는 Bunyang Flow 초기 코드베이스를 생성한다.
- 문서 중심 MVP 진행이 가능하도록 모노레포 구조, 공통 도메인 타입, 웹/백엔드 초깃값을 마련한다.
- 이후 기능 단위 작업이 이어질 수 있도록 최소 실행 가능한 상태를 만든다.

# 참고한 문서

- `docs/PRD.md`
- `docs/TECH_ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
- `docs/SCREEN_SPEC.md`
- `docs/WIREFRAMES.md`
- `docs/CLAUDE.md`
- `docs/AGENTS.md`

# 영향 범위

- 루트 워크스페이스 설정
- `apps/web`
- `apps/api`
- `packages/shared`
- 로컬 개발 설정 파일
- `ai/work` 작업 로그

# 구현 단계

1. 루트 모노레포 설정과 공통 TypeScript 설정을 추가한다.
2. `packages/shared`에 도메인 enum, 타입, 목업 데이터를 정의한다.
3. `apps/api`에 REST API 골격과 핵심 조회 엔드포인트를 만든다.
4. `apps/web`에 문서 기준 핵심 라우트와 모바일 우선 UI를 구현한다.
5. 로컬 실행/빌드 검증 후 작업 로그를 작성한다.
6. 논리적 업무 단위별로 commit, push를 수행한다.

# 리스크 또는 가정

- 초기 구현은 실제 외부 데이터 수집 대신 문서 정합성 검증용 목업 데이터를 사용한다.
- 패키지 매니저는 현재 환경에 설치된 `npm` workspaces를 사용한다.
- Prisma, Redis, AWS 연동은 문서 방향성만 반영하고 이번 초기 구현에서는 실제 연결을 생략한다.
- SEO/SSR, 수집 파이프라인, 인증은 후속 단위에서 확장 가능한 구조만 준비한다.
