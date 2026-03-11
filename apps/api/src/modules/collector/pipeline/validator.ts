import type { RawOffering } from "../adapters/publicdata.adapter";

export interface ValidationResult {
  valid: RawOffering[];
  invalid: Array<{ item: RawOffering; reason: string }>;
}

/**
 * 수집 데이터 검증: 필수 필드 존재 여부, 날짜 형식 등 확인
 */
export function validateOfferings(items: RawOffering[]): ValidationResult {
  const valid: RawOffering[] = [];
  const invalid: Array<{ item: RawOffering; reason: string }> = [];

  for (const item of items) {
    const reason = checkRequired(item);
    if (reason) {
      invalid.push({ item, reason });
    } else {
      valid.push(item);
    }
  }

  return { valid, invalid };
}

function checkRequired(item: RawOffering): string | null {
  if (!item.offerNo) return "offerNo missing";
  if (!item.complexName) return "complexName missing";
  if (!item.region) return "region missing";
  if (!item.announcementDate) return "announcementDate missing";
  return null;
}
