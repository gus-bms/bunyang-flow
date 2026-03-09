# 데이터 모델 초안: 분양 전용 서비스

## 1. 문서 목적

- PRD와 화면 기획을 실제 구현 가능한 데이터 구조로 연결한다.
- MVP 기준으로 필요한 핵심 엔티티와 관계를 정의한다.
- 이후 DB 스키마, API 설계, 관리자 데이터 입력 구조의 기준으로 사용한다.

## 2. 설계 원칙

- 매매/전월세 엔티티는 두지 않는다.
- 단지 중심이 아니라 `분양 이벤트`와 `청약 일정` 중심으로 설계한다.
- 사용자의 조건과 단지 공급 조건을 연결할 수 있어야 한다.
- 분양 단계는 별도 값으로 저장하되 일정 기반 자동 계산이 가능해야 한다.

## 3. 핵심 엔티티 목록

- complex: 단지 기본 정보
- housing_offering: 분양 공고 단위 정보
- housing_type: 타입별 공급 정보
- schedule_event: 단계별 일정 정보
- supply_rule: 공급 유형 및 자격 조건
- regulation_info: 규제 정보 (분양가 상한제, 전매제한 등)
- competition_rate: 경쟁률 및 당첨 가점 데이터
- user_profile: 사용자 기본 조건
- user_score: 사용자 청약 가점 정보
- user_interest: 관심 단지 저장
- user_alert: 알림 설정
- complex_comparison: 비교함

## 4. 엔티티 상세

## 4.1 complex

### 목적
- 단지의 고정 기본 정보를 저장한다.

### 필드
- id
- name
- slug
- address_full
- address_region_1
- address_region_2
- address_region_3
- latitude
- longitude
- developer_name
- builder_name
- total_households
- parking_count
- move_in_planned_at
- created_at
- updated_at

### 메모
- 하나의 단지는 여러 차수 또는 공고를 가질 수 있으므로 분양 공고 정보는 분리한다.

## 4.2 housing_offering

### 목적
- 특정 단지의 특정 분양 공고 단위를 저장한다.

### 필드
- id
- complex_id
- announcement_name
- announcement_number
- offering_type
- sale_category
- current_stage
- is_active
- announcement_date
- application_start_date
- application_end_date
- winner_announcement_date
- contract_start_date
- contract_end_date
- move_in_planned_at
- subscription_home_url
- official_notice_url
- summary_text
- data_checked_at
- created_at
- updated_at

### 예시 enum
- offering_type: `private_sale`, `public_sale`
- sale_category: `apt`, `officetel`, `public_housing`
- current_stage:
  - `planned`
  - `announcement_open`
  - `special_supply_open`
  - `priority_1_open`
  - `priority_2_open`
  - `winner_announced`
  - `contract_open`
  - `move_in_pending`
  - `closed`

### 메모
- 현재 서비스 MVP는 `apt`에 집중하지만 확장을 고려해 category를 둔다.

## 4.3 housing_type

### 목적
- 타입별 면적, 세대수, 분양가를 저장한다.

### 필드
- id
- housing_offering_id
- type_name
- exclusive_area_m2
- supply_households_total
- supply_households_general
- supply_households_special
- sale_price_min
- sale_price_max
- contract_deposit_rate
- middle_payment_rate
- balance_rate
- option_price_note
- created_at
- updated_at

### 메모
- 실제 분양가는 타입별, 층별, 동별로 달라질 수 있으므로 MVP에서는 범위값으로 시작할 수 있다.

## 4.4 schedule_event

### 목적
- 공고별 세부 일정 이벤트를 정규화해 저장한다.

### 필드
- id
- housing_offering_id
- event_type
- starts_at
- ends_at
- is_all_day
- display_label
- status
- created_at
- updated_at

### 예시 enum
- event_type:
  - `announcement`
  - `special_supply`
  - `priority_1`
  - `priority_2`
  - `winner_announcement`
  - `contract`
  - `move_in`
- status:
  - `upcoming`
  - `ongoing`
  - `completed`

### 메모
- 리스트, 상세 타임라인, 캘린더는 이 테이블을 기준으로 만든다.

## 4.5 supply_rule

### 목적
- 공급 유형별 자격 조건을 구조화한다.

### 필드
- id
- housing_offering_id
- supply_kind
- resident_region_rule
- homeless_required
- head_of_household_required
- subscription_account_required
- subscription_min_period_months
- special_supply_type
- income_rule_text
- asset_rule_text
- note_text
- created_at
- updated_at

### 예시 enum
- supply_kind: `general`, `special`
- special_supply_type:
  - `newlywed`
  - `first_time_buyer`
  - `multi_child`
  - `elder_support`
  - `institution_recommendation`

### 메모
- 초기에는 복잡한 계산 대신 구조화 가능한 최소 조건만 보관한다.
- 고난도 계산 규칙은 후속 단계에서 룰 엔진으로 분리할 수 있다.

## 4.6 regulation_info

### 목적
- 분양 공고별 규제 조건을 구조화해 저장한다.

### 필드
- id
- housing_offering_id
- price_cap_applied (분양가 상한제 적용 여부)
- resale_restriction_months (전매제한 기간, 개월 수)
- resale_restriction_note (전매제한 상세 조건 텍스트)
- residency_obligation_months (실거주 의무 기간, 개월 수)
- rewin_restriction_years (재당첨 제한 기간, 년 수)
- speculation_zone_type (투기과열지구/조정대상지역/비규제 등)
- interim_loan_available (중도금 대출 가능 여부)
- interim_loan_note (중도금 대출 관련 참고 텍스트)
- created_at
- updated_at

### 예시 enum
- speculation_zone_type:
  - `speculation_overheated` (투기과열지구)
  - `adjustment_target` (조정대상지역)
  - `non_regulated` (비규제)

### 메모
- 규제 조건은 정책 변경에 따라 수시로 바뀔 수 있으므로, 공고 기준 시점의 조건을 스냅샷으로 저장한다.
- 규제 변경 시 알림 발송을 위해 변경 이력 추적이 후속 단계에서 필요하다.

## 4.7 competition_rate

### 목적
- 분양 공고별 경쟁률 및 당첨 가점 데이터를 저장한다.

### 필드
- id
- housing_offering_id
- housing_type_id (nullable, 타입별 경쟁률)
- supply_kind (일반공급/특별공급)
- special_supply_type (nullable, 특별공급 유형)
- recruitment_count (모집 세대수)
- applicant_count (신청자 수)
- competition_ratio (경쟁률)
- min_winning_score (최저 당첨 가점, nullable)
- max_winning_score (최고 당첨 가점, nullable)
- avg_winning_score (평균 당첨 가점, nullable)
- data_source (데이터 출처: 청약홈 등)
- recorded_at (기록 시점)
- created_at
- updated_at

### 예시 enum
- supply_kind: `general`, `special`
- special_supply_type: `newlywed`, `first_time_buyer`, `multi_child`, `elder_support`
- data_source: `subscription_home`, `manual_input`

### 메모
- 과거 분양 데이터도 저장해 유사 단지 경쟁률 비교에 활용한다.
- 접수 기간 중 실시간 경쟁률 업데이트는 후속 확장에서 별도 처리한다.
- 타입별, 공급유형별 경쟁률을 분리 저장해 상세한 비교가 가능하게 한다.

## 4.8 user_profile

### 목적
- 추천과 자격 진단에 필요한 사용자의 기본 조건을 저장한다.

### 필드
- id
- user_id
- residence_region_1
- residence_region_2
- is_homeless
- is_head_of_household
- has_subscription_account
- subscription_joined_at
- marital_status
- child_count
- special_supply_flags
- budget_min
- budget_max
- preferred_regions
- updated_at

### 메모
- `special_supply_flags`는 배열 또는 별도 조인 테이블로 분리 가능하다.

## 4.9 user_score

### 목적
- 사용자의 청약 가점 계산 결과를 저장한다.

### 필드
- id
- user_id
- homeless_period_years (무주택 기간, 년)
- homeless_score (무주택 기간 점수, 0~32)
- dependent_count (부양가족 수)
- dependent_score (부양가족 점수, 0~35)
- subscription_period_years (청약통장 가입 기간, 년)
- subscription_score (통장 가입 기간 점수, 0~17)
- total_score (총 가점, 0~84)
- calculated_at
- updated_at

### 메모
- 가점 계산 공식은 「주택공급에 관한 규칙」에 따르며, 규정 변경 시 계산 로직을 업데이트해야 한다.
- 프로필의 기본 조건과 가점 정보를 연결해 단지 상세에서 자동 매칭에 활용한다.

## 4.10 user_interest

### 목적
- 사용자가 저장한 관심 단지를 관리한다.

### 필드
- id
- user_id
- housing_offering_id
- created_at

### 제약
- user_id + housing_offering_id는 unique

## 4.11 user_alert

### 목적
- 사용자별 알림 설정을 관리한다.

### 필드
- id
- user_id
- housing_offering_id
- alert_type
- alert_offset_days
- channel_type
- is_enabled
- created_at
- updated_at

### 예시 enum
- alert_type:
  - `announcement`
  - `application_start`
  - `winner_announcement`
  - `contract`
- channel_type:
  - `push`
  - `email`
  - `sms`

## 4.12 complex_comparison

### 목적
- 비교함에 담긴 단지를 저장한다.

### 필드
- id
- user_id
- housing_offering_id
- created_at

### 제약
- 사용자당 최대 저장 개수 제한 필요

## 5. 엔티티 관계

### 관계 구조
- complex 1:N housing_offering
- housing_offering 1:N housing_type
- housing_offering 1:N schedule_event
- housing_offering 1:N supply_rule
- housing_offering 1:1 regulation_info
- housing_offering 1:N competition_rate
- competition_rate N:1 housing_type (optional)
- user_profile 1:1 user
- user 1:1 user_score
- user 1:N user_interest
- user 1:N user_alert
- user 1:N complex_comparison

## 6. 분양 단계 계산 로직 초안

### 목적
- `housing_offering.current_stage`를 일정 기반으로 계산하거나 보정한다.

### 우선순위 예시
1. contract 일정이 진행 중이면 `contract_open`
2. winner announcement가 완료되었고 contract가 예정이면 `winner_announced`
3. priority_2 일정이 진행 중이면 `priority_2_open`
4. priority_1 일정이 진행 중이면 `priority_1_open`
5. special_supply 일정이 진행 중이면 `special_supply_open`
6. announcement가 공개되었고 접수 전이면 `announcement_open`
7. 공고 전이면 `planned`
8. 모든 일정 종료 후 입주 전이면 `move_in_pending`

### 메모
- 운영상 수동 보정 값이 필요할 수 있어 계산 결과와 표시값을 분리할 수도 있다.

## 7. API 관점의 주요 조회 단위

## 7.1 홈
- 현재 접수 가능한 분양 공고 목록
- 일정 임박 공고 목록
- 사용자 조건 기반 추천 목록

## 7.2 분양 찾기
- 필터 기반 housing_offering 검색
- 결과 수
- 사용 가능한 필터 옵션 집계

## 7.3 단지 상세
- complex
- housing_offering
- housing_type 목록
- schedule_event 목록
- supply_rule 목록
- 사용자 관심 여부
- 사용자 조건 기준 간이 자격 결과

## 7.4 일정
- user_interest 기준 schedule_event 조회

## 8. 관리자/수집 관점 메모

### 최소 수집 단위
- 단지 기본 정보
- 분양 공고 정보
- 타입별 분양가
- 주요 일정
- 공급 조건

### 최신성 관리
- data_checked_at 필드로 마지막 검증 시점 저장
- 변경 이력 테이블은 후속 단계에서 추가 가능

## 9. MVP 구현 우선순위

### 1순위 테이블
- complex
- housing_offering
- housing_type
- schedule_event
- regulation_info
- competition_rate
- user_profile
- user_score
- user_interest

### 2순위 테이블
- supply_rule
- user_alert
- complex_comparison

## 10. 오픈 이슈

- 특별공급 자격 계산을 어느 수준까지 자동화할지
- 공고문 원문의 비정형 데이터를 어떻게 구조화할지
- 일정 변경 시 사용자 알림 재발송 정책을 둘지
- 하나의 단지에 여러 공고 차수가 생길 때 UX를 어떻게 풀지
- 과거 경쟁률 데이터의 수집 주기와 범위 (최근 몇 년치, 어느 지역까지)
- 경쟁률 데이터 크롤링 시 청약홈 데이터 이용 정책 확인 필요
- 규제 조건 변경 시 기존 저장 데이터의 갱신 정책
- 가점 계산 규정 변경 시 자동 반영 방안
- 지도 서비스 선택 (Kakao Map / Naver Map / Google Maps) 및 라이선스 비용

