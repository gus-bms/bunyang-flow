# [11] 자금 계획 시뮬레이션 (1단계 확장)

## 작업 목표
단지 상세 페이지의 "자금 시뮬레이션 열기" 버튼을 실제로 동작하게 한다.
타입 선택 → 계약금/중도금/잔금 납입 계획 → 중도금 대출 필요액 계산을 제공한다.

## 참고 문서
- `docs/PRD.md` — 8.10 자금 계획 시뮬레이션
- `docs/SCREEN_SPEC.md` — 5.4 단지 상세 자금 계획 요약 블록
- `docs/DATA_MODEL.md` — HousingType (계약금/중도금/잔금 필드)

## 선행 작업
- [01] Prisma DB 설정 (HousingType 데이터 필요)

## 영향 범위
- `apps/web/src/pages/OfferingDetailPage.tsx` — 시뮬레이션 섹션 활성화
- `apps/web/src/components/offerings/FundingSimulator.tsx` — 신규 컴포넌트

## 구현 단계

### 1. FundingSimulator 컴포넌트
입력:
- 타입 선택 드롭다운 (단지의 HousingType 목록)
- 자기 자금 입력 (선택, 원 단위 or 만원 단위)

출력:
- 분양가 총액
- 계약금 금액 + 납입 예정일 (계약일 기준)
- 중도금 회차별 금액 + 납입 예정일 (중도금 일정 기준)
- 잔금 금액 + 납입 예정일 (입주 예정일 기준)
- 중도금 대출 필요액 = 중도금 총액 - 자기 자금 중 중도금 충당분
- 중도금 이자 예상 (기본 금리 3.5% 기준, 참고용 명시)

### 2. 계산 로직
`packages/shared/logic.ts`에 순수 함수로 추가:
```typescript
function calculateFundingPlan(type: HousingType, selfFund: number, contractDate: Date)
```

### 3. 면책 고지
PRD 기준: "대출 금리는 참고용 평균 기준이며 실제와 다를 수 있음" 문구 필수 표시

### 4. 다른 단지와 자금 계획 비교
비교함(`ComparisonPage`)에서 자금 계획 항목도 노출 (타입 선택 상태 저장 필요)

## 리스크 / 가정
- 정밀 대출 한도 계산은 MVP 제외 (PRD 명시)
- 금리는 하드코딩 상수로 관리, 변경 시 단일 위치에서 수정 가능하게

## 완료 조건
- 단지 상세에서 타입 선택 후 납입 계획이 표시됨
- 자기 자금 입력 시 중도금 대출 필요액 계산
- 이자 참고값 및 면책 고지 표시
