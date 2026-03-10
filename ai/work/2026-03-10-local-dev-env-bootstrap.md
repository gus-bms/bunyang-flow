# 작업 내용

- 루트 `.env`를 기준으로 API와 웹이 실행되도록 스크립트와 설정을 정리했다.
- 루트에 `dev`, `db:up`, `db:down`, `db:ps`, `db:logs` 스크립트를 추가했다.
- Vite가 루트 `.env`를 직접 읽도록 `envDir`를 설정했다.
- 루트 `.env.example`에 카카오 로그인/JWT/DB 관련 값을 통합 정리했다.
- API는 `root .env`와 `apps/api/.env`를 모두 자동으로 읽도록 조정했다.
- `README.md`에 로컬 실행 절차를 추가했다.

# 참고 문서

- `docs/TECH_ARCHITECTURE.md`
- `docs/CLAUDE.md`
- `docs/AGENTS.md`

# 주요 결정 사항

- 루트 `.env`를 권장하되, 이미 사용 중인 `apps/api/.env`도 그대로 허용했다.
- 로컬 DB는 현재 목업 데이터 구조상 필수가 아니므로 선택 실행으로 유지했다.
- 앱 실행은 `npm run dev` 한 번으로 가능하게 정리했다.

# 검증 또는 확인 내용

- `npm install`
- `npm run check`
- `npm run build`
- `apps/api/.env`만 있는 상태에서 `npm run dev:api` 실행 및 Nest 기동 확인

# 후속 이슈

- Prisma 도입 시 `DATABASE_URL`을 실제 애플리케이션 코드에서 사용하도록 연결해야 한다.
- Docker가 설치되지 않은 환경에서는 `db:*` 스크립트를 사용할 수 없다.
