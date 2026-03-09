# 스프린트 2: UX 완성도 및 누락 화면 구현

## 작성일
2026-03-09

## 배경
스프린트 1에서 기획 Gap을 보완했으나, 신규 CSS 클래스 미정의, 온보딩 단계형 UX 미완성,
알림 설정 화면 미구현, SchedulePage/ProfilePage 정보 부족 등 UX 완성도 이슈가 남아 있음.

---

## 1. CSS 스타일 보완 (`styles.css`)

스프린트 1에서 추가된 JSX 클래스들이 스타일 없이 방치됨. 브라우저 기본 스타일로만 표시.

### 추가할 클래스
- `range-labels` — range input 양 끝 min/max 레이블 (justify-content: space-between)
- `filter-row` — 정렬 select 등 단일 행 필터 영역
- `highlight-list` — 입지요약/유의사항 리스트 스타일
- `highlight-list--caution` — 경고색 변형 (주황/빨강 계열)
- `timeline__item--completed` — 완료된 일정 (muted, 취소선 없이 회색처리)
- `timeline__item--ongoing` — 진행 중 일정 (강조색 배경)
- `timeline__item--upcoming` — 예정 일정 (기본값, 현재 스타일 그대로)
- `comparison-grid` — 비교함 수평 스크롤 그리드
- `comparison-col` — 비교 단지 컬럼 (카드 형태)
- `comparison-col__header`, `comparison-row`, `comparison-row--full`, `comparison-label`
- `saved-card-wrap` — 카드 + 저장해제 버튼 wrapper
- `unsave-button` — 저장해제 버튼 스타일
- `quick-filters` — 홈 빠른 필터 행 (가로 스크롤 허용)
- `active-filters`, `active-filter-chip` — 적용된 필터 칩 표시
- `outline-button` — 테두리만 있는 버튼 (관심저장 해제 상태)
- `offering-card__actions` — 카드 상단 액션 버튼 그룹
- `d-day-badge` — 일정 페이지 D-day 표시 뱃지
- `step-indicator` — 온보딩 진행도 점 행
- `step-dot`, `step-dot--active`, `step-dot--done` — 진행 상태 점
- `alert-row` — 알림 설정 행 (단지명 + 토글)
- `toggle-switch`, `toggle-switch--on` — 알림 on/off 토글 스위치

---

## 2. 온보딩 3단계 스텝 UI (`OnboardingPage.tsx`)

현재 단일 폼 → 3단계 분리

- **Step 1**: 관심 지역 + 무주택 여부 + 세대주 여부
- **Step 2**: 예산 상한 슬라이더 + 청약통장 보유/기간
- **Step 3**: 특별공급 대상 선택 (4종)

### UI 요소
- 상단에 `step-indicator` (점 3개, 현재 단계 강조)
- "이전" / "다음" / 마지막 단계에서 "맞춤 추천 보기" 버튼
- 단계 이동 시 `profile` 중간 저장 불필요 (완료 시 한 번에 저장)

---

## 3. SchedulePage 보완

현재 단순 목록 → D-day 강조, 단지별 그룹, 알림 토글

### 변경 사항
- D-day 계산: `새벽 0시 기준 오늘 날짜`와 일정 날짜의 차이
  - D-0: "오늘", D+: "D+N (지남)", D-: "D-N"
- 단지별 그룹핑 (complexName 기준)
- 각 일정 행에 알림 토글 버튼 (store `alertedOfferingIds` 연동)
- 알림 설정 페이지 링크

---

## 4. AlertsPage 신규 구현 (`/alerts`)

SCREEN_SPEC 5.9에 정의된 화면.

### 기능
- 관심 단지 목록에서 알림 설정 관리
- 단지별 알림 on/off 토글 스위치
- 저장 단지가 없으면 안내 + 분양 찾기 링크

### 구현 계획
- `store.alertedOfferingIds: string[]` 추가
- `toggleAlert(offeringId)` 액션 추가
- AlertsPage: 관심 단지 목록 iterate + 알림 토글
- App.tsx에 `/alerts` 라우트 추가
- SchedulePage에서 `/alerts` 링크 추가

---

## 5. ProfilePage 보완

현재 기본 조건 요약만 → 전체 프로필 정보 + 빠른 도구 링크

### 변경 사항
- 세대주 여부 표시 추가
- 청약통장 가입 기간 (개월) 표시
- 비교함 단지 수 표시 + 비교함 링크
- "자격 진단 바로가기", "가점 계산 바로가기" 링크 추가
- 특별공급 플래그를 한국어 레이블로 표시

---

## 6. AppShell 비교함 카운트 배지

- 상단 바 우측 "조건 설정" 링크 옆에 비교함 카운트 표시
- comparisonIds.length > 0이면 뱃지 표시
- 클릭 시 /compare로 이동

---

## 가정 및 리스크

- **가정**: 알림 기능은 클라이언트 상태만 관리 (실제 push 연동은 미포함)
- **리스크**: 온보딩 스텝 중간에 뒤로가기 시 데이터 유실 → step별 local state 분리로 해결
- **가정**: D-day 계산은 순수 JS Date 기반 (서버 time zone 불일치 주의 메모)
