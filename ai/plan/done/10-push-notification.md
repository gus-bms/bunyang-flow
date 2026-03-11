# [10] 푸시/이메일 알림 발송 구현

## 작업 목표
알림 설정 UI는 이미 있으나 실제 발송 로직이 없는 상태다.
관심 단지의 주요 일정(모집공고, 접수 시작, 발표일, 계약일)에 대한 알림 발송을 구현한다.

## 참고 문서
- `docs/SCREEN_SPEC.md` — 5.9 알림 설정
- `docs/CLAUDE.md` — alerts 모듈, 확장 가능 구조 명시
- `docs/PRD.md` — 8.13 일정 캘린더 및 알림

## 선행 작업
- [01] Prisma DB 설정
- [04] Interests / Alerts API 모듈

## 영향 범위
- `apps/api/src/modules/alerts/` — 발송 로직 추가
- `apps/api/src/modules/collector/` — 변경 감지 후 알림 트리거

## 구현 단계

### 1. 알림 발송 채널 결정 (우선순위)
1. 웹 푸시 (Web Push API + VAPID) — 브라우저 지원, 앱 없이 가능
2. 이메일 — 회원가입 이메일 수집 시 (카카오 계정 이메일 활용)
3. 문자 — 3단계 확장

### 2. 웹 푸시 구현
- `web-push` 패키지 설치 (API)
- VAPID 키 생성 및 환경변수 등록
- 브라우저에서 푸시 구독 (`PushSubscription` 객체) → `POST /alerts/subscribe`로 서버에 저장
- Service Worker 등록 (`apps/web/public/sw.js`)

### 3. 알림 스케줄러
NestJS `@nestjs/schedule` 크론 잡:
- 매일 오전 8시: 당일 D-1 일정이 있는 사용자에게 알림 발송
- 일정 당일: 해당 이벤트 사용자에게 당일 알림

### 4. 알림 발송 흐름
```
[Cron Job] → [AlertsService.getDueTodayAlerts()]
           → [UserAlert 조회] → [PushSubscription 조회]
           → [web-push.sendNotification()]
           → [발송 로그 기록]
```

### 5. 알림 템플릿
- 모집공고: "{{단지명}} 모집공고가 공개되었습니다"
- 접수 D-1: "내일 {{단지명}} 1순위 접수가 시작됩니다"
- 발표일: "{{단지명}} 당첨자 발표일입니다"
- 계약일: "{{단지명}} 계약 기간이 시작되었습니다"

## 리스크 / 가정
- 웹 푸시는 HTTPS 환경 필요 (개발 환경 localhost 예외 처리)
- 카카오 로그인으로 이메일을 수집하려면 추가 동의 항목 필요
- 대량 발송 시 큐 시스템(BullMQ) 도입 검토 (현재 직접 발송으로 MVP)

## 완료 조건
- 알림 설정한 단지의 일정 당일 브라우저 푸시 알림 수신
- 알림 발송 로그가 DB에 기록됨
- 알림 해제 시 더 이상 발송되지 않음
