import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { CollectorModule } from "../collector/collector.module";

@Module({
  imports: [CollectorModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
