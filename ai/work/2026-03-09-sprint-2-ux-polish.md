# 스프린트 2: UX 완성도 및 누락 화면 구현 완료 로그

## 작성일
2026-03-09

## 참조 플랜
`ai/plan/2026-03-09-sprint-2-ux-polish.md`

---

## 완료된 변경 사항

### 1. styles.css — 신규 CSS 클래스 정의

스프린트 1에서 추가된 JSX 클래스들의 스타일 전부 정의 완료.

| 클래스 | 용도 |
|---|---|
| `range-labels` | range input 양 끝 min/max 레이블 |
| `filter-row` | 정렬 select 등 단일 행 필터 |
| `highlight-list`, `--caution` | 입지요약/유의사항 리스트 |
| `timeline__item--completed/ongoing/upcoming` | 일정 완료/진행/예정 시각 구분 |
| `comparison-grid/col/row/label` | 비교함 레이아웃 |
| `saved-card-wrap`, `unsave-button` | 관심 단지 카드 + 해제 버튼 |
| `quick-filters`, `active-filter-chip` | 홈 빠른 필터, 적용 필터 표시 |
| `outline-button` | 테두리 버튼 (관심저장 해제 상태) |
| `offering-card__actions` | 카드 액션 버튼 그룹 |
| `d-day-badge`, `--today`, `--past` | D-day 배지 3종 |
| `step-indicator`, `step-dot`, `--active`, `--done` | 온보딩 진행도 |
| `step-nav` | 온보딩 이전/다음 버튼 행 |
| `toggle-switch`, `--on` | 알림 on/off 스위치 |
| `alert-row` | 알림 설정 행 |
| `compare-badge` | 비교함 카운트 뱃지 |
| `profile-grid`, `profile-item`, `--label`, `--value` | 프로필 그리드 |
| `schedule-group`, `--header`, `schedule-event-row`, `--info` | 일정 그룹/행 |

---

### 2. OnboardingPage — 3단계 스텝 UI

- **Step 1**: 관심 지역, 무주택 여부, 세대주 여부
- **Step 2**: 예산 상한 슬라이더, 청약통장 보유/가입기간 슬라이더
- **Step 3**: 특별공급 대상 다중 선택 (4종)
- 상단 `step-indicator` 점 3개 (완료/현재/미완료 상태 표시)
- 이전/다음 버튼 분리, 마지막 단계에서 "맞춤 추천 보기" 버튼
- 완료 시 updateProfile 한 번에 저장

---

### 3. SchedulePage — D-day 배지 + 단지별 그룹 + 알림 토글

- `getDDayLabel()` 유틸: 오늘 기준 D-day / D+N(지남) / D-N 계산
- 일정 목록을 `offeringId` 기준으로 단지별 그룹핑 (Map → 배열)
- 각 그룹 헤더에 알림 토글 스위치 (`toggle-switch`) + store `toggleAlert` 연결
- 각 일정 행에 D-day 배지 표시
- 빈 상태 처리 + "분양 찾기" 링크
- 우상단 "알림 설정" 링크 (`/alerts`)

---

### 4. AlertsPage — 신규 구현 (`/alerts`)

- 관심 단지별 알림 on/off 토글 스위치
- StageBadge + 단지명 + 다음 일정 정보 표시
- 알림 기능 안내 텍스트 (푸시 알림은 로그인 후 지원 예정 명시)
- 빈 상태 처리 ("저장한 단지가 없습니다")
- "← 일정 캘린더로 돌아가기" 링크

#### store 변경
- `alertedOfferingIds: string[]` 상태 추가 (기본값: `["gangdong-river-park"]`)
- `toggleAlert(offeringId)` 액션 추가

---

### 5. ProfilePage — 조건 상세 + 비교함/알림 현황

- 내 청약 조건을 `profile-grid` 2열 레이아웃으로 표시
  - 거주 지역, 주택 상태, 세대주, 예산 상한, 청약통장(개월 수), 특별공급
  - 특별공급 플래그를 한국어 레이블로 변환
- 저장 상태 섹션에 비교함 / 알림 설정 건수 + 각 페이지 링크
- "빠른 도구" 섹션 (자격 진단, 가점 계산, 일정 보기 링크)
- 우상단 "조건 재설정" 버튼 (PageHeader action)

---

### 6. AppShell — 비교함 카운트 배지

- `comparisonIds.length > 0`이면 상단 바 우측에 "비교함 N" 링크 동적 표시
- `compare-badge` 스타일로 카운트 강조 (주황색)

---

### 7. App.tsx — `/alerts` 라우트 추가

- `AlertsPage` import 및 `/alerts` Route 등록

---

## 최종 라우트 목록

| 경로 | 페이지 |
|---|---|
| `/` | 홈 |
| `/onboarding` | 온보딩 (3단계 스텝) |
| `/offerings` | 분양 찾기 목록 |
| `/offerings/map` | 분양 지도 |
| `/offerings/:id` | 단지 상세 |
| `/eligibility` | 자격 진단 |
| `/score` | 가점 계산기 |
| `/saved` | 관심 단지 |
| `/schedule` | 일정 캘린더 |
| `/alerts` | 알림 설정 ✨ 신규 |
| `/compare` | 비교함 |
| `/me` | 마이페이지 |

---

## 검증 사항

- 모든 신규 CSS 클래스가 해당 컴포넌트에서 실제 사용됨
- store `alertedOfferingIds` + `toggleAlert`가 SchedulePage, AlertsPage 양방향 연동
- 온보딩 단계 이동 시 이전 단계 데이터 유지 (각 step별 useState로 분리)

---

## 오픈 이슈 (다음 스프린트 대상)

- Prisma 스키마 + PostgreSQL 실제 연결
- Redis 캐시 연결
- JWT 인증 + 서버사이드 프로필/관심 저장
- Kakao Map SDK 연동
- 실제 푸시 알림 (FCM/Web Push) 연동
- 청약홈 크롤링 파이프라인
