# 작업 로그 — Kakao Map SDK 연동 (Task 03)

## 실제 변경 사항

### 공유 패키지
- `packages/shared/src/types.ts` — `OfferingsFilter`에 bbox 필드 추가 (swLat/swLng/neLat/neLng)

### API (apps/api)
- `src/modules/offerings/dto.ts` — bbox 쿼리 파라미터 추가
- `src/modules/offerings/offerings.controller.ts` — `toFilters()`에 bbox 전달
- `src/modules/offerings/offerings.service.ts` — `buildWhere()`에 bbox 필터 추가 (latitude/longitude 범위 쿼리)

### Frontend (apps/web)
- `src/types/kakao.maps.d.ts` — 신규: Kakao Maps SDK 최소 타입 선언
- `src/components/map/KakaoMap.tsx` — 신규: 지도 초기화, CustomOverlay 마커, bounds 변경 이벤트, 선택 상태 관리
- `src/components/map/MapInfoCard.tsx` — 신규: 마커 클릭 시 floating 정보 카드
- `src/pages/OfferingsMapPage.tsx` — 전면 재작성: 실제 Kakao Map 기반, 단계 필터 칩, 이 지역 재검색, 하단 리스트 패널
- `src/lib/api.ts` — `getOfferingsForMap()` 함수 추가
- `.env.example` — `VITE_KAKAO_MAP_KEY` 항목 추가

## 주요 결정 사항

- Kakao SDK를 `index.html`이 아닌 `KakaoMap.tsx`에서 동적으로 스크립트 주입 (API 키를 env에서 읽기 위해)
- `VITE_KAKAO_MAP_KEY` 미설정 시 fallback UI 표시 (API 키 없이도 앱 동작)
- 마커: CustomOverlay + HTMLElement 방식으로 단계별 색상 적용 및 클릭 이벤트 처리
- "이 지역 재검색" 버튼: bounds 변경 후 수동 갱신 (지도 이동 시 자동 API 호출 없음)

## 검증 내용

- `tsc --noEmit` API, Web, Shared 모두 에러 없음

## 후속 이슈

- Kakao Developers에서 JavaScript 앱키 발급 필요 (https://developers.kakao.com)
- 마커 클러스터링: 공고 밀집 지역에서 필요 시 MarkerClusterer 라이브러리 추가
- `VITE_KAKAO_MAP_KEY` 환경변수를 `.env` 파일에 실제 키값으로 설정해야 지도 동작
