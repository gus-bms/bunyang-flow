# 작업 목표

- 루트 `.env`만으로 API와 웹이 로컬에서 실행되도록 개발 환경을 단순화한다.
- 로컬 PostgreSQL 기동 스크립트를 추가해 DB 셋업 진입 장벽을 낮춘다.
- 현재 목업 기반 구조에서 DB가 필수가 아니라는 점을 실행 문서에 명확히 남긴다.

# 참고한 문서

- `docs/AGENTS.md`
- `docs/TECH_ARCHITECTURE.md`
- `docs/CLAUDE.md`

# 영향 범위

- 루트 `package.json`
- 루트 `.env.example`
- `apps/api/package.json`
- `apps/web/vite.config.ts`
- 루트 `README.md`
- `ai/work`

# 구현 단계

1. API가 루트 `.env`를 자동 로드하도록 스크립트를 정리한다.
2. 웹이 루트 `.env`의 `VITE_*` 값을 읽도록 Vite 설정을 조정한다.
3. 루트에서 DB up/down/ps와 전체 dev 실행 스크립트를 추가한다.
4. 로컬 실행 방법을 README에 정리하고 검증한다.

# 리스크 또는 가정

- 현재는 Prisma/DB 연결이 없으므로 DB 실행은 선택 사항으로 둔다.
- `.env`는 루트 기준으로 관리한다.
