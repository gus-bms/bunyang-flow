# [09] Redis 캐싱 적용

## 작업 목표
자주 조회되는 API 응답에 Redis 캐싱을 적용해 DB 부하를 줄이고 응답 속도를 높인다.

## 참고 문서
- `docs/CLAUDE.md` — Redis TTL 설정: list=5~10min, detail=30min, home sections=10min
- `docs/TECH_ARCHITECTURE.md` — ElastiCache Redis (AWS)

## 선행 작업
- [01] Prisma DB 설정 완료 필요

## 영향 범위
- `apps/api/` — Redis 모듈, 캐싱 데코레이터
- `docker-compose.yml` — Redis 서비스 추가

## 구현 단계

### 1. 로컬 Redis 컨테이너
`docker-compose.yml`에 Redis 서비스 추가:
```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
```

### 2. NestJS Redis 모듈 설정
```
@nestjs/cache-manager + cache-manager-redis-store 설치
```
`AppModule`에 `CacheModule.register()` 글로벌 등록

### 3. TTL 기준별 캐싱 적용
| 엔드포인트 | TTL |
|-----------|-----|
| `GET /offerings` (리스트) | 5~10분 |
| `GET /offerings/:id` (상세) | 30분 |
| `GET /offerings` (홈 섹션용) | 10분 |
| `GET /interests` | 1분 |
| `GET /schedule` | 5분 |

### 4. 캐시 무효화
- 관리자가 공고 데이터 수정 시 해당 `offering:id` 캐시 삭제
- Collector가 데이터 업데이트 시 리스트 캐시 전체 무효화

### 5. Cache Key 설계
```
offerings:list:{queryHash}     — 필터 조합별 캐시
offerings:detail:{id}          — 상세
offerings:map:{bboxHash}       — 지도 바운딩 박스별
home:sections                  — 홈 섹션
```

## 리스크 / 가정
- 개발 환경에서는 `cache-manager` 메모리 캐시로 대체 가능 (Redis 없이 동작)
- 캐시 히트율 모니터링은 초기엔 로그로 대체

## 완료 조건
- 동일한 필터 조건 반복 요청 시 DB 쿼리 없이 캐시에서 반환
- 데이터 변경 시 캐시가 무효화됨
- docker-compose 실행 시 Redis 포함
