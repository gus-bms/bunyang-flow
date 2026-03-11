# [12] 실시간 경쟁률 업데이트 (접수 기간 중)

## 작업 목표
현재 과거 데이터 기반의 경쟁률만 표시하는 것에서, 접수 중인 단지의 실시간 경쟁률을 제공한다.

## 참고 문서
- `docs/PRD.md` — 8.8 경쟁률 정보, 실시간 경쟁률 후속 확장 명시
- `docs/CLAUDE.md` — competition rates hourly during open periods

## 선행 작업
- [01] Prisma DB 설정
- [02] 데이터 수집 파이프라인 (청약홈 API 경쟁률 수집)

## 영향 범위
- `apps/api/src/modules/collector/` — 경쟁률 수집 크론 (시간당)
- `apps/web/src/pages/OfferingDetailPage.tsx` — 실시간 경쟁률 섹션
- `apps/api/src/modules/offerings/` — competition 엔드포인트 갱신

## 구현 단계

### 1. 경쟁률 수집 크론 강화
- 접수 중인 단지(`currentStage` in `{special_supply_open, priority_1_open, priority_2_open}`) 대상
- 매시간 청약홈 API에서 경쟁률 데이터 수집
- CompetitionRate 테이블 upsert

### 2. API 응답에 실시간 여부 표시
`GET /offerings/:id/competition` 응답에 필드 추가:
```json
{
  "isLive": true,
  "lastUpdatedAt": "2026-03-10T14:00:00Z",
  "rates": [...]
}
```

### 3. 프론트엔드 Polling
- 접수 중인 단지 상세에서 경쟁률 블록에 "실시간" 배지 표시
- TanStack Query `refetchInterval: 10분` (접수 중인 경우만)
- 마지막 업데이트 시각 표시

### 4. 면책 고지
"실시간 경쟁률은 청약홈 기준이며 최대 1시간 지연이 있을 수 있습니다" 표시

## 리스크 / 가정
- 청약홈 API 호출 빈도 제한 확인 필요
- 접수 기간 외에는 실시간 수집 비활성화 (불필요한 API 호출 방지)

## 완료 조건
- 접수 중인 단지 상세에서 실시간 경쟁률이 표시됨
- 마지막 업데이트 시각이 표시됨
- 접수 기간 외 단지는 과거 데이터 기반 표시
