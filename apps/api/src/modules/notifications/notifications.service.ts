import { Injectable, Logger } from "@nestjs/common";
import webpush from "web-push";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../prisma/prisma.service";

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_EMAIL = process.env.VAPID_EMAIL ?? "mailto:admin@bunyang-flow.com";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
}

export interface PushSubscriptionDto {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async subscribe(userId: string, dto: PushSubscriptionDto): Promise<void> {
    await this.prisma.pushSubscription.upsert({
      where: { userId_endpoint: { userId, endpoint: dto.endpoint } },
      update: { p256dh: dto.keys.p256dh, auth: dto.keys.auth },
      create: {
        userId,
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
      },
    });
  }

  async unsubscribe(userId: string, endpoint: string): Promise<void> {
    await this.prisma.pushSubscription.deleteMany({
      where: { userId, endpoint },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendDailyAlerts(): Promise<void> {
    if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
      this.logger.warn("VAPID keys not set — skipping push notification");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    // 오늘/내일 일정인 단지를 알림 설정한 사용자 조회
    const alerts = await this.prisma.userAlert.findMany({
      include: {
        user: { include: { pushSubscriptions: true } },
        offering: {
          include: {
            scheduleEvents: {
              where: { startsAt: { in: [today, tomorrow] } },
            },
          },
        },
      },
    });

    for (const alert of alerts) {
      const dueEvents = alert.offering.scheduleEvents.filter((ev) =>
        (alert.eventTypes as string[]).includes(ev.eventType),
      );

      if (!dueEvents.length) continue;
      if (!alert.user.pushSubscriptions.length) continue;

      for (const event of dueEvents) {
        const isToday = event.startsAt === today;
        const message = isToday
          ? `${alert.offering.complexName} ${event.displayLabel}이 오늘입니다.`
          : `내일 ${alert.offering.complexName} ${event.displayLabel}이 시작됩니다.`;

        for (const sub of alert.user.pushSubscriptions) {
          try {
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              JSON.stringify({ title: "분양플로우 알림", body: message }),
            );
          } catch (err) {
            this.logger.warn(`Push failed: ${sub.endpoint}`);
            // 410 Gone — 구독 삭제
            if ((err as any)?.statusCode === 410) {
              await this.prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
            }
          }
        }
      }
    }
  }

  getVapidPublicKey(): string {
    return VAPID_PUBLIC;
  }
}
