# [03] 지도 뷰 — Kakao Map SDK 실제 연동

## 작업 목표
현재 CSS 절대좌표 프로토타입인 `OfferingsMapPage`를 실제 Kakao Map SDK 기반으로 교체한다.
마커, 클러스터링, 클릭 팝업, 바운딩 박스 기반 조회, 필터 연동까지 구현한다.

## 참고 문서
- `docs/SCREEN_SPEC.md` — 5.2.1 분양 찾기(지도 뷰) 섹션
- `docs/CLAUDE.md` — Map SDK: Kakao Map preferred, 오픈 결정 사항 확인
- `docs/TECH_ARCHITECTURE.md` — 프론트엔드 스택

## 영향 범위
- `apps/web/src/pages/OfferingsMapPage.tsx` — 전면 재작성
- `apps/web/index.html` — Kakao Map SDK 스크립트 태그 추가
- `apps/api/src/modules/offerings/` — 바운딩 박스 쿼리 파라미터 추가
- `apps/web/.env` — Kakao Map API 키

## 구현 단계

### 1. Kakao Map SDK 설정
- Kakao Developers에서 JavaScript 앱키 발급
- `apps/web/index.html`에 SDK 스크립트 추가
- `.env`에 `VITE_KAKAO_MAP_KEY` 등록
- TypeScript 타입 선언 파일 작성 (`kakao.maps.d.ts`) 또는 `@types/kakao.maps.d.ts` 패키지 확인

### 2. Map 컴포넌트 분리
```
apps/web/src/components/map/
  KakaoMap.tsx          — 지도 초기화, 마커 렌더링 담당
  MapMarker.tsx         — 단계별 마커 커스텀 오버레이
  MapCluster.tsx        — 마커 클러스터러 설정
  MapInfoCard.tsx       — 마커 클릭 시 팝업 카드 (단지명, 단계, 분양가, D-day)
```

### 3. OfferingsMapPage 재작성
- `useKakaoMap` 훅으로 지도 초기화 및 마커 관리
- 지도 이동/줌 이벤트 → 바운딩 박스 추출 → API 재조회
- "이 지역 재검색" 버튼 (수동 갱신)
- 하단 슬라이드 패널: 현재 영역 단지 리스트, 위로 스와이프 시 리스트 확장
- 리스트 뷰 ↔ 지도 뷰 전환 유지
- 분양 단계 칩 필터 상단 고정

### 4. 마커 색상 범례
- 단계별 색상 상수를 `StageBadge`와 동일한 값으로 통일
- 지도 하단 범례 UI

### 5. API 바운딩 박스 쿼리 지원
```
GET /offerings/map?swLat=&swLng=&neLat=&neLng=&stages=...
```
- `OfferingsController`에 `map` 전용 엔드포인트 좌표 파라미터 추가
- `OfferingsService.listForMap()` — 바운딩 박스 필터링 추가

## 리스크 / 가정
- Kakao Map SDK는 `window.kakao` 전역 객체 방식이므로 React lifecycle과 충돌 가능 → useEffect 초기화로 관리
- 클러스터러는 별도 라이브러리(`MarkerClustering`) 필요, CDN 추가 검토
- SDK 로딩 전 렌더링 방지를 위한 로딩 상태 처리 필요

## 완료 조건
- 실제 지도 위에 단지 마커가 좌표 기반으로 표시됨
- 마커 클릭 시 팝업 카드 노출
- 지도 이동 시 해당 영역 단지 목록 갱신
- 리스트 뷰 ↔ 지도 뷰 전환 정상 동작
- 단계 필터가 지도 뷰에서도 동일하게 적용
