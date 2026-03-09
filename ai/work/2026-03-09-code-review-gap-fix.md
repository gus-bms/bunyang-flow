# 코드 리뷰 Gap 보완 작업 완료 로그

## 작성일
2026-03-09

## 참조 플랜
`ai/plan/2026-03-09-code-review-gap-fix.md`

---

## 완료된 변경 사항

### 1. 문서 수정

#### `docs/DATA_MODEL.md`
- 섹션 번호 중복 오류 수정
  - `user_alert` 4.8 → 4.11
  - `complex_comparison` 4.9 → 4.12

---

### 2. 화면별 구현 보완

#### `apps/web/src/pages/EligibilityPage.tsx`
- `hasSubscriptionAccount` 체크박스 추가
  - 체크 해제 시 청약통장 가입 기간 입력 필드 숨김 처리
- 특별공급 대상 다중 선택 칩 추가 (신혼부부, 생애최초, 다자녀, 노부모부양 4종)
  - `specialSupplyFlags` store 상태 반영
- 진단 결과 하단에 "해당 단지 보러가기" 링크 추가
  - 적격 공급 유형이 있으면 접수 가능 단계 필터 URL, 없으면 전체 목록으로 연결

#### `apps/web/src/pages/ScorePage.tsx`
- 숫자 input → `range` 슬라이더로 교체 (SCREEN_SPEC "3 슬라이더" 반영)
  - 무주택 기간: 0~15년 슬라이더
  - 부양가족: 0~6명 슬라이더
  - 청약통장: 0~15년 슬라이더
- 각 슬라이더 현재 값 레이블 표시
- 가점 결과 섹션에 "최대 N점" 부연 정보 추가
- 추천 단지 목록을 `<OfferingCard>` 컴포넌트로 교체

#### `apps/web/src/pages/OfferingDetailPage.tsx`
- 페이지 헤더에 관심 저장/해제 토글 버튼 추가 (store `toggleSavedOffering` 연결)
- `locationHighlights` 비어있지 않으면 "입지 요약" 섹션 렌더링
- `noticeHighlights` 비어있지 않으면 "유의사항" 섹션 렌더링
- 일정 타임라인 아이템에 `timeline__item--completed`, `timeline__item--ongoing`, `timeline__item--upcoming` CSS 클래스 분기 적용
- 기간이 있는 일정(`endsAt`)에 종료일 표시 추가

#### `apps/web/src/pages/SavedPage.tsx`
- 각 카드 하단에 "저장 해제" 버튼 추가
- 정렬 select 추가 (일정 임박순 기본값 / 저장 최신순)
- 빈 상태에 "분양 찾기로 이동" 링크 추가
- 비교함 보기 링크 추가 (단지가 있을 때만 표시)

#### `apps/web/src/pages/OnboardingPage.tsx`
- 특별공급 옵션에 `elder_support` (노부모부양) 추가
- `isHomeless`, `isHeadOfHousehold` 체크박스 추가
- 예산 슬라이더 레이블을 현재 값 기반으로 변경 ("N억 이하" 표시)
- 범위 레이블 (3억 / 12억) 추가

#### `apps/web/src/pages/HomePage.tsx`
- "특별공급 진행 중인 단지" 섹션 추가 (stage === `special_supply_open`)
  - 데이터 없으면 섹션 숨김
- "일정이 임박한 단지" 섹션 추가 (winner_announced, contract_open)
  - 데이터 없으면 섹션 숨김
- 내 조건 요약 패널 하단에 빠른 필터 칩 5개 추가
  - 분양 예정 / 모집 공고 / 특별공급 / 1순위 접수 / 발표 예정
  - 클릭 시 `/offerings?stages=<stage>` 로 이동

#### `apps/web/src/pages/OfferingsListPage.tsx`
- 분양가 상한 슬라이더 추가 (0 = 제한 없음, 최대 15억)
- 공급 유형 필터 칩 추가 (전체 / 민간분양 / 공공분양)
- 결과 헤더에 정렬 select 추가 (접수 가능순 / 일정 임박순 / 최신 공고순)
- 적용된 필터 칩 표시 (지역, 분양가 상한, 공급 유형 조건 적용 시)
- "전체 초기화" 버튼으로 지역/가격/공급유형 필터 한 번에 초기화

---

### 3. 신규 화면 구현

#### `apps/web/src/pages/ComparisonPage.tsx` (신규)
- `/compare` 라우트 신규 생성
- 빈 상태: 안내 문구 + "분양 찾기에서 추가" 링크
- 비교 단지 있을 때: 카드 컬럼 그리드 레이아웃
  - 단계 배지, 지역, 분양가, 전용면적, 세대수, 다음 일정, 규제, 경쟁률 나열
  - 개별 "제거" 버튼으로 비교함에서 삭제 가능
  - 단지명 클릭 시 상세 페이지 이동

#### `apps/web/src/app/App.tsx`
- `/compare` 라우트 추가

---

### 4. 공통 컴포넌트 수정

#### `apps/web/src/components/offerings/OfferingCard.tsx`
- "비교" 버튼 추가 (관심 저장 버튼 옆)
  - 비교함에 있을 때 "비교 ✓" + `is-active` 클래스
  - 최대 5개 제한은 store 레벨에서 처리

#### `apps/web/src/store/preferences.ts`
- `comparisonIds: string[]` 상태 추가
- `toggleComparison(id)` 액션 추가 (최대 5개 제한 포함)

---

## 미구현 항목 (다음 스프린트 대상)

- 온보딩 5단계 스텝 UI (프로그레스 바 포함)
- 알림 설정 화면 (`/alerts` 라우트)
- 지도 Kakao SDK 연동
- 홈 상단 검색창
- Prisma + PostgreSQL 실제 연결
- Redis 캐시 연결
- JWT 인증

---

## 검증 사항

- TypeScript 타입 일관성: 새 필드/컴포넌트 모두 기존 `@bunyang-flow/shared` 타입 인터페이스 준수
- 라우트 등록: `/compare` 정상 추가
- store 직렬화: Zustand persist 미들웨어로 `comparisonIds` 자동 저장
- 데이터 흐름: ComparisonPage는 기존 `getOfferings()` API를 그대로 사용하여 mock 데이터 의존성 유지

---

## 오픈 이슈

- `timeline__item--completed/ongoing/upcoming` CSS 클래스 스타일은 아직 정의되지 않음 → 스타일 파일 업데이트 필요
- `highlight-list`, `highlight-list--caution` CSS 클래스도 신규 → 스타일 파일 업데이트 필요
- `comparison-grid`, `comparison-col` CSS 클래스 신규 → 스타일 파일 업데이트 필요
- `saved-card-wrap`, `unsave-button` CSS 클래스 신규
- `quick-filters`, `active-filters`, `active-filter-chip` CSS 클래스 신규
- 이 클래스들은 CSS 파일에 추가 정의가 필요하며, 현재는 브라우저 기본 스타일로 표시됨
