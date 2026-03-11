import { Module } from "@nestjs/common";
import { CollectorService } from "./collector.service";
import { PublicDataAdapter } from "./adapters/publicdata.adapter";
import { DbWriter } from "./pipeline/db-writer";
import { ChangeDetector } from "./pipeline/change-detector";

@Module({
  providers: [CollectorService, PublicDataAdapter, DbWriter, ChangeDetector],
  exports: [CollectorService],
})
export class CollectorModule {}
