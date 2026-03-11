import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PublicDataAdapter } from "./adapters/publicdata.adapter";
import { validateOfferings } from "./pipeline/validator";
import { DbWriter } from "./pipeline/db-writer";
import { ChangeDetector } from "./pipeline/change-detector";

@Injectable()
export class CollectorService {
  private readonly logger = new Logger(CollectorService.name);

  constructor(
    private readonly adapter: PublicDataAdapter,
    private readonly dbWriter: DbWriter,
    private readonly changeDetector: ChangeDetector,
  ) {}

  /**
   * 공고 수집: 매일 새벽 3시, 낮 12시
   */
  @Cron("0 3 * * *")
  async collectOfferings() {
    await this.runCollection("scheduled:offerings");
  }

  @Cron("0 12 * * *")
  async collectOfferingsMidday() {
    await this.runCollection("scheduled:offerings:midday");
  }

  /**
   * 경쟁률 수집: 매시간 (청약 접수 기간 중에만 유효)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async collectCompetitionRates() {
    this.logger.log("[collector] competition rates — 구현 예정 (청약홈 API 키 필요)");
    // TODO: 접수 중인 공고만 대상으로 PublicDataAdapter.fetchCompetitionRates() 호출
  }

  async runCollection(trigger: string): Promise<void> {
    this.logger.log(`[collector] start — trigger=${trigger}`);

    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
      try {
        await this.executePipeline();
        return;
      } catch (err) {
        attempt++;
        const delay = Math.pow(2, attempt) * 1000; // exponential backoff
        this.logger.error(`[collector] attempt ${attempt} failed`, err);
        if (attempt < maxAttempts) {
          this.logger.log(`[collector] retrying in ${delay}ms...`);
          await sleep(delay);
        } else {
          this.logger.error("[collector] max retries reached — manual intervention required");
        }
      }
    }
  }

  private async executePipeline(): Promise<void> {
    // 1. Fetch
    const raw = await this.adapter.fetchOfferings();
    this.logger.log(`[collector] fetched ${raw.length} offerings`);

    if (raw.length === 0) return;

    // 2. Validate
    const { valid, invalid } = validateOfferings(raw);
    if (invalid.length > 0) {
      this.logger.warn(`[collector] ${invalid.length} invalid items skipped`);
    }

    // 3. Detect changes (before write)
    const changed = await this.changeDetector.detect(valid);
    if (changed.length > 0) {
      this.logger.log(`[collector] ${changed.length} offerings changed: ${JSON.stringify(changed.map((c) => c.offerNo))}`);
      // TODO: Task 10 — push/email notification trigger
    }

    // 4. Write to DB
    const result = await this.dbWriter.upsertOfferings(valid);
    this.logger.log(`[collector] upserted=${result.upserted} errors=${result.errors}`);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
