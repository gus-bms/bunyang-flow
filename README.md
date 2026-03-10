# Bunyang Flow

분양과 청약 실행 정보에 집중한 Bunyang Flow의 초기 모노레포다.

## 로컬 실행

### 1. 환경변수 준비

루트 `.env`를 쓰거나, 이미 사용 중인 `apps/api/.env`를 그대로 써도 된다.

```bash
cp .env.example .env
```

카카오 로그인 테스트를 하려면 아래 값을 채워야 한다.

- `KAKAO_CLIENT_ID`
- `KAKAO_CLIENT_SECRET`
- `KAKAO_CALLBACK_URL=http://localhost:4000/auth/kakao/callback`
- `FRONTEND_URL=http://localhost:5173`
- `JWT_SECRET`

`apps/api/.env`를 유지하는 경우에도 API는 자동으로 해당 파일을 읽는다. 웹은 별도 설정이 없으면 `http://localhost:4000`을 기본 API 주소로 사용한다.

### 2. 의존성 설치

```bash
npm install
```

### 3. 로컬 DB 기동

현재 앱은 목업 데이터 기반이라 DB가 없어도 실행되지만, 로컬 PostgreSQL이 필요하면 아래 스크립트를 사용한다.

```bash
npm run db:up
```

상태 확인:

```bash
npm run db:ps
```

종료:

```bash
npm run db:down
```

### 4. 앱 실행

API와 웹을 함께 띄우려면:

```bash
npm run dev
```

개별 실행:

```bash
npm run dev:api
npm run dev:web
```

## 접속 주소

- Web: `http://localhost:5173`
- API: `http://localhost:4000`
- Kakao callback: `http://localhost:4000/auth/kakao/callback`

## 메모

- 웹은 루트 `.env`의 `VITE_*` 값을 직접 읽는다.
- API는 `root .env`와 `apps/api/.env`를 모두 자동으로 읽도록 스크립트가 설정돼 있다.
- 로컬 DB는 추후 Prisma 연동 전까지 선택 사항이다.
