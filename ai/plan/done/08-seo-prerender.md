# [08] SEO 대응 — 단지 상세 페이지 프리렌더링

## 작업 목표
현재 순수 CSR(Vite) 구조에서 검색엔진 노출이 중요한 페이지(`/offerings/:id`, `/offerings?region=*`)에 대해 SEO를 개선한다.

## 참고 문서
- `docs/CLAUDE.md` — SEO 오픈 결정 사항: prerender service vs Next.js migration
- `docs/TECH_ARCHITECTURE.md` — 프론트엔드 스택

## 영향 범위
- `apps/web/` 빌드 설정
- 결정에 따라 Next.js 마이그레이션이면 전체 프론트엔드에 영향

## 구현 단계 (Option A: vite-plugin-prerender 사용)

### 1. 정적 프리렌더링 플러그인 도입
```
vite-plugin-prerender 또는 @prerenderer/plugin-vite 설치
```
- 빌드 시 `/offerings/:id` 경로를 정적 HTML로 생성
- 크롤러가 접근하면 정적 HTML 반환, 일반 사용자는 SPA로 hydrate

### 2. 메타 태그 동적 설정
- `react-helmet-async` 도입
- `OfferingDetailPage`에서 단지명, 지역, 분양가를 og:title / og:description에 삽입

### 3. sitemap.xml 생성
- 빌드 시 현재 DB의 모든 공고 ID로 sitemap.xml 자동 생성
- `robots.txt` 설정

---

## 구현 단계 (Option B: Next.js 마이그레이션)

### 1. apps/web을 Next.js App Router로 전환
- React Router → Next.js App Router로 라우팅 변경
- TanStack Query, Zustand 유지
- SEO 핵심 페이지에 `generateStaticParams` + ISR 적용

### 2. 마이그레이션 범위
- `/offerings/:id` → SSG + ISR (revalidate: 3600)
- `/offerings` → SSR (필터 파라미터 기반)
- 나머지 페이지 → CSR 유지 가능

---

## 결정 필요 사항
⚠️ CLAUDE.md에 "prerender service vs Next.js migration 결정 보류" 명시됨.
작업 시작 전 팀과 방향 확정 필요.
- 빠른 적용: Option A (vite-plugin-prerender)
- 장기 유지보수: Option B (Next.js)

## 완료 조건
- `/offerings/:id` URL을 크롤러가 접근하면 의미 있는 HTML 반환
- og:title, og:description에 단지 정보 포함
- sitemap.xml 생성
