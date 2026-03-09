# 코드 리뷰 기반 기획 Gap 보완 계획

## 작성일
2026-03-09

## 배경
기획 문서(PRD, SCREEN_SPEC, DATA_MODEL, TECH_ARCHITECTURE)와 현재 구현 코드를 비교 리뷰한 결과,
MVP 구조는 잘 잡혀 있으나 각 화면에서 기획 세부 항목이 미구현된 부분이 확인됨.

본 문서는 발견된 Gap을 분류하고 구현 계획을 정리한다.

---

## 1. 문서 오류 수정

### 1.1 DATA_MODEL.md 섹션 번호 중복
- `user_profile`이 4.8, `user_score`가 4.9인데, 이후 `user_alert`도 4.8, `complex_comparison`도 4.9로 중복 표기됨
- **조치**: `user_alert` → 4.11, `complex_comparison` → 4.12로 정정

---

## 2. 화면별 Gap 분류 및 구현 계획

### 2.1 EligibilityPage (자격 진단)

#### Gap
- `hasSubscriptionAccount` 체크박스 없음 (청약통장 보유 여부)
- 특별공급 대상 여부 선택 없음 (신혼부부, 생애최초 등)
- 결과 후 "추천 단지 보기" 링크 없음

#### 구현 계획
- `hasSubscriptionAccount` 체크박스 추가
- `specialSupplyFlags` 다중 선택 칩 추가 (newlywed, first_time_buyer, multi_child, elder_support)
- 진단 결과 하단에 `/offerings?specialSupply=...` 링크 버튼 추가

---

### 2.2 ScorePage (가점 계산기)

#### Gap
- 숫자 input 대신 슬라이더(range) 사용이 기획 의도 (SCREEN_SPEC: "3 슬라이더")
- 추천 단지 목록이 텍스트만 출력 (OfferingCard 미사용)

#### 구현 계획
- 3개 입력 모두 `<input type="range">` + 현재 값 표시로 교체
  - 무주택 기간: 0~15년
  - 부양가족: 0~6명
  - 청약통장: 0~15년
- 추천 단지 섹션을 OfferingCard 컴포넌트로 교체

---

### 2.3 OfferingDetailPage (단지 상세)

#### Gap
- 관심 단지 저장/해제 버튼 없음
- `locationHighlights` 렌더링 없음 (타입은 정의됨)
- `noticeHighlights` 렌더링 없음 (타입은 정의됨)
- 일정 타임라인 `status` 값에 따른 시각 구분 없음 (completed/ongoing/upcoming)
- 원문 공고 링크 없음

#### 구현 계획
- 헤더 영역에 관심 저장 토글 버튼 추가 (store `toggleSavedOffering` 연결)
- `locationHighlights` 비어있지 않으면 "입지 요약" 섹션 추가
- `noticeHighlights` 비어있지 않으면 "유의사항" 섹션 추가
- 타임라인 아이템에 `data-status` 속성 + CSS 클래스 분기 (completed → muted, ongoing → accent)
- 추후 `subscriptionHomeUrl` 등 외부 링크 필드 추가 시를 고려한 자리 확보 (현재 OfferingDetail 타입에 미정의)

---

### 2.4 SavedPage (관심 단지)

#### Gap
- 저장 해제 버튼 없음 (카드 단위)
- 정렬 옵션 없음 (일정 임박순/저장 최신순)

#### 구현 계획
- 각 OfferingCard 하단에 "저장 해제" 버튼 추가
- 정렬 select 추가 (일정 임박순 기본값 / 저장 최신순)

---

### 2.5 OnboardingPage (온보딩)

#### Gap
- `elder_support` 특별공급 옵션 누락 (3종만 있고 4종 필요)
- `isHomeless`, `isHeadOfHousehold` 입력 없음
- 단일 폼 구조 (기획 5단계 스텝 구조 대비 단순화)

#### 구현 계획 (MVP 범위)
- `elder_support` (노부모부양) 옵션 추가
- `isHomeless`, `isHeadOfHousehold` 체크박스 추가
- 스텝 UI는 이번 스프린트에서 구현하지 않음 (폼 단순화 유지, 단계별 스텝은 향후 개선)

---

### 2.6 HomePage (홈)

#### Gap
- SCREEN_SPEC 5.1의 6개 섹션 중 3개만 구현됨
  - 누락: "특별공급 진행 단지" 섹션
  - 누락: "일정 임박 단지" (winner_announced + contract_open) 섹션
  - 누락: 빠른 필터 칩 (분양예정/모집공고/특별공급/1순위/발표예정)

#### 구현 계획
- "특별공급 진행 단지" 섹션 추가 (stage === 'special_supply_open')
- "일정 임박 단지" 섹션 추가 (winner_announced, contract_open)
- 상단 히어로 하단에 빠른 필터 칩 5개 추가 → 클릭 시 /offerings?stages=... 로 이동

---

### 2.7 OfferingsListPage (분양 찾기)

#### Gap
- OfferingsFilter 타입은 maxPrice, minArea, specialSupplyType을 지원하나 UI에 노출 안 됨
- 정렬 옵션 없음
- 적용된 필터 칩 표시 없음

#### 구현 계획
- "분양가 상한" 슬라이더 추가 (maxPrice, 3억~15억, 1000만 단위)
- "공급 유형" 선택 추가 (민간분양/공공분양 radio 또는 select)
- 정렬 select 추가 (접수가능순 기본값 / 일정임박순 / 최신공고순)
- 적용된 필터 칩 표시 + 개별 초기화 버튼 (지역, 분양가 상한 적용 시 표시)

---

### 2.8 ComparisonPage (비교함) — 신규

#### Gap
- SCREEN_SPEC 5.7에 정의된 비교함 화면이 전혀 구현되지 않음
- 라우트 없음, 컴포넌트 없음, store 상태 없음

#### 구현 계획
- store에 `comparisonIds: string[]` + `toggleComparison(id)` 추가
  - 최대 5개 제한
- 비교 버튼을 OfferingCard에 추가 (관심 저장 버튼 옆)
- `/compare` 라우트 + ComparisonPage 신규 생성
  - 비교 단지 없을 때: 안내 문구
  - 1개 이상: 카드 그리드 + 핵심 지표 테이블 (분양가, 전용면적, 경쟁률, 단계, 규제)
- App.tsx에 라우트 추가
- AppShell 하단 내비에 비교함 진입점 추가 (저장 단지와 분리)

---

## 3. 구현 범위 미포함 항목 (향후 스프린트)

- 온보딩 5단계 스텝 UI (프로그레스 바 포함)
- 알림 설정 화면 (`/alerts` 라우트)
- 지도 Kakao SDK 연동
- 검색창 (홈 상단)
- Prisma + PostgreSQL 실제 연결
- Redis 캐시 연결
- JWT 인증

---

## 4. 가정 및 리스크

- **가정**: 모든 구현은 mock 데이터 기반. 실 API 연결 시 타입 인터페이스는 동일하게 유지됨.
- **리스크**: OfferingCard에 비교 버튼 추가 시 카드 레이아웃이 밀릴 수 있음 → 아이콘 버튼으로 최소화.
- **가정**: `locationHighlights`, `noticeHighlights` mock 데이터에 빈 배열이면 해당 섹션 숨김 처리.
