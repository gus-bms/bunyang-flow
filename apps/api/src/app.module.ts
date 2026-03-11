import { Module } from "@nestjs/common";
import { ScheduleModule as NestScheduleModule } from "@nestjs/schedule";

import { AppCacheModule } from "./cache/cache.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AdminModule } from "./modules/admin/admin.module";
import { AlertsModule } from "./modules/alerts/alerts.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CollectorModule } from "./modules/collector/collector.module";
import { EligibilityModule } from "./modules/eligibility/eligibility.module";
import { InterestsModule } from "./modules/interests/interests.module";
import { OfferingsModule } from "./modules/offerings/offerings.module";
import { ScheduleModule } from "./modules/schedule/schedule.module";
import { ScoreModule } from "./modules/score/score.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    NestScheduleModule.forRoot(),
    AppCacheModule,
    PrismaModule,
    AuthModule,
    OfferingsModule,
    ScheduleModule,
    EligibilityModule,
    ScoreModule,
    InterestsModule,
    AlertsModule,
    CollectorModule,
    AdminModule,
    UsersModule,
    NotificationsModule,
  ],
})
export class AppModule {}
