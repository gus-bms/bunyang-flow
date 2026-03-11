/**
 * 공공데이터포털 청약홈 Open API 어댑터
 *
 * 서비스키 발급: https://www.data.go.kr → "청약홈 분양정보 조회 서비스" 신청
 * 환경변수: PUBLIC_DATA_API_KEY, KAKAO_CLIENT_ID (Kakao Local REST API로 주소→좌표 변환)
 *
 * 사용 API:
 *   분양 목록  GET https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail
 *   좌표변환   GET https://dapi.kakao.com/v2/local/search/address.json
 *
 * 응답 공통 구조:
 *   { currentCount, data: [...], matchCount, page, perPage, totalCount }
 */

const BASE_URL = "https://api.odcloud.kr";
const KAKAO_LOCAL_URL = "https://dapi.kakao.com/v2/local/search/address.json";

export interface RawOffering {
  offerNo: string;           // PBLANC_NO
  houseManageNo: string;     // HOUSE_MANAGE_NO
  complexName: string;       // HOUSE_NM
  region: string;            // SUBSCRPT_AREA_CODE_NM
  addressFull: string;       // HSSPLY_ADRES
  latitude: number;
  longitude: number;
  totalHouseholds: number;   // TOT_SUPLY_HSHLDCO
  announcementDate: string;  // RCRIT_PBLANC_DE (YYYY-MM-DD)
  specialSupplyStartDate: string; // SPSPLY_RCEPT_BGNDE
  specialSupplyEndDate: string;   // SPSPLY_RCEPT_ENDDE
  priority1StartDate: string;     // GNRL_RNK1_CRSPAREA_RCPTDE
  priority1EndDate: string;       // GNRL_RNK1_CRSPAREA_ENDDE
  priority2StartDate: string;     // GNRL_RNK2_CRSPAREA_RCPTDE
  priority2EndDate: string;       // GNRL_RNK2_CRSPAREA_ENDDE
  winnerAnnouncementDate: string; // PRZWNER_PRESNATN_DE
  contractStartDate: string;      // CNTRCT_CNCLS_BGNDE
  contractEndDate: string;        // CNTRCT_CNCLS_ENDDE
  moveInDate: string;             // MVN_PREARNGE_YM (YYYYMM or YYYY-MM-DD)
  developerName: string;          // BSNS_MBY_NM
  builderName: string;            // CNSTRCT_ENTRPS_NM
  homepageUrl: string;            // PBLANC_URL or HMPG_ADRES
  priceCapApplied: boolean;       // PARCPRC_ULS_AT === 'Y'
  speculationOverheated: boolean; // SPECLT_RDN_EARTH_AT === 'Y'
  adjustmentTarget: boolean;      // MDAT_TRGET_AREA_SECD === 'Y'
}

export interface RawCompetitionRate {
  offerNo: string;
  typeName: string;
  recruitmentCount: number;
  applicantCount: number;
}

interface DataGoKrResponse<T> {
  currentCount: number;
  data: T[];
  matchCount: number;
  page: number;
  perPage: number;
  totalCount: number;
}

// 분양정보 상세조회 API 원본 필드 (getAPTLttotPblancDetail)
interface AptLttotDetailItem {
  HOUSE_MANAGE_NO: string;
  PBLANC_NO: string;
  HOUSE_NM: string;
  HOUSE_SECD_NM?: string;
  SUBSCRPT_AREA_CODE_NM: string;
  HSSPLY_ADRES: string;
  TOT_SUPLY_HSHLDCO: number;
  RCRIT_PBLANC_DE: string;
  SPSPLY_RCEPT_BGNDE?: string;
  SPSPLY_RCEPT_ENDDE?: string;
  GNRL_RNK1_CRSPAREA_RCPTDE?: string;
  GNRL_RNK1_CRSPAREA_ENDDE?: string;
  GNRL_RNK2_CRSPAREA_RCPTDE?: string;
  GNRL_RNK2_CRSPAREA_ENDDE?: string;
  PRZWNER_PRESNATN_DE?: string;
  CNTRCT_CNCLS_BGNDE?: string;
  CNTRCT_CNCLS_ENDDE?: string;
  MVN_PREARNGE_YM?: string;
  BSNS_MBY_NM?: string;
  CNSTRCT_ENTRPS_NM?: string;
  PBLANC_URL?: string;
  HMPG_ADRES?: string;
  PARCPRC_ULS_AT?: string;
  SPECLT_RDN_EARTH_AT?: string;
  MDAT_TRGET_AREA_SECD?: string;
}

// 경쟁률 API 원본 필드
interface CompetitionItem {
  공고번호: string;
  주택형: string;
  공급세대수: number;
  청약건수: number;
}

interface KakaoAddressDoc {
  x: string; // 경도(longitude)
  y: string; // 위도(latitude)
}

export class PublicDataAdapter {
  private readonly serviceKey = process.env.PUBLIC_DATA_API_KEY ?? "";
  private readonly kakaoRestKey = process.env.KAKAO_CLIENT_ID ?? "";
  // 같은 파이프라인 실행 내 주소 중복 geocoding 방지
  private readonly geocodeCache = new Map<string, { lat: number; lng: number }>();

  async fetchOfferings(page = 1, perPage = 100): Promise<RawOffering[]> {
    if (!this.serviceKey) {
      // PUBLIC_DATA_API_KEY 미설정 — 파이프라인 구조 검증용 빈 응답
      return [];
    }

    const url = new URL(
      `${BASE_URL}/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail`,
    );
    url.searchParams.set("serviceKey", this.serviceKey);
    url.searchParams.set("page", String(page));
    url.searchParams.set("perPage", String(perPage));
    url.searchParams.set("returnType", "json");

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(
        `[PublicDataAdapter] fetchOfferings failed: ${res.status} ${res.statusText}`,
      );
    }

    const json = (await res.json()) as DataGoKrResponse<AptLttotDetailItem>;
    const mapped = json.data.map(this.mapOffering);

    // Kakao REST API 키가 있으면 좌표 변환
    if (this.kakaoRestKey) {
      for (const item of mapped) {
        if (item.addressFull && item.latitude === 0 && item.longitude === 0) {
          const coords = await this.geocodeAddress(item.addressFull);
          item.latitude = coords.lat;
          item.longitude = coords.lng;
          // API 과부하 방지용 짧은 지연
          await sleep(60);
        }
      }
    }

    return mapped;
  }

  async fetchCompetitionRates(offerNo: string): Promise<RawCompetitionRate[]> {
    if (!this.serviceKey) return [];

    const url = new URL(
      `${BASE_URL}/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancMdlgAplyResult`,
    );
    url.searchParams.set("serviceKey", this.serviceKey);
    url.searchParams.set("page", "1");
    url.searchParams.set("perPage", "100");
    url.searchParams.set("returnType", "json");
    url.searchParams.set("cond[PBLANC_NO::EQ]", offerNo);

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`[PublicDataAdapter] fetchCompetitionRates failed: ${res.status}`);
    }

    const json = (await res.json()) as DataGoKrResponse<CompetitionItem>;
    return json.data.map((item) => ({
      offerNo: item.공고번호,
      typeName: item.주택형,
      recruitmentCount: item.공급세대수,
      applicantCount: item.청약건수,
    }));
  }

  private async geocodeAddress(
    address: string,
  ): Promise<{ lat: number; lng: number }> {
    const cached = this.geocodeCache.get(address);
    if (cached) return cached;

    try {
      const url = new URL(KAKAO_LOCAL_URL);
      url.searchParams.set("query", address);
      url.searchParams.set("size", "1");

      const res = await fetch(url.toString(), {
        headers: { Authorization: `KakaoAK ${this.kakaoRestKey}` },
      });

      if (!res.ok) return { lat: 0, lng: 0 };

      const json = (await res.json()) as { documents: KakaoAddressDoc[] };
      const doc = json.documents?.[0];
      if (!doc) return { lat: 0, lng: 0 };

      const coords = { lat: parseFloat(doc.y), lng: parseFloat(doc.x) };
      this.geocodeCache.set(address, coords);
      return coords;
    } catch {
      return { lat: 0, lng: 0 };
    }
  }

  private mapOffering(item: AptLttotDetailItem): RawOffering {
    // MVN_PREARNGE_YM 형식: YYYYMM → YYYY-MM-DD 로 정규화
    const rawMoveIn = item.MVN_PREARNGE_YM ?? "";
    const moveInDate =
      rawMoveIn.length === 6
        ? `${rawMoveIn.slice(0, 4)}-${rawMoveIn.slice(4, 6)}-01`
        : rawMoveIn;

    return {
      offerNo: item.PBLANC_NO,
      houseManageNo: item.HOUSE_MANAGE_NO,
      complexName: item.HOUSE_NM,
      region: item.SUBSCRPT_AREA_CODE_NM,
      addressFull: item.HSSPLY_ADRES,
      latitude: 0,
      longitude: 0,
      totalHouseholds: Number(item.TOT_SUPLY_HSHLDCO) || 0,
      announcementDate: item.RCRIT_PBLANC_DE ?? "",
      specialSupplyStartDate: item.SPSPLY_RCEPT_BGNDE ?? "",
      specialSupplyEndDate: item.SPSPLY_RCEPT_ENDDE ?? "",
      priority1StartDate: item.GNRL_RNK1_CRSPAREA_RCPTDE ?? "",
      priority1EndDate: item.GNRL_RNK1_CRSPAREA_ENDDE ?? "",
      priority2StartDate: item.GNRL_RNK2_CRSPAREA_RCPTDE ?? "",
      priority2EndDate: item.GNRL_RNK2_CRSPAREA_ENDDE ?? "",
      winnerAnnouncementDate: item.PRZWNER_PRESNATN_DE ?? "",
      contractStartDate: item.CNTRCT_CNCLS_BGNDE ?? "",
      contractEndDate: item.CNTRCT_CNCLS_ENDDE ?? "",
      moveInDate,
      developerName: item.BSNS_MBY_NM ?? "",
      builderName: item.CNSTRCT_ENTRPS_NM ?? "",
      homepageUrl: item.PBLANC_URL ?? item.HMPG_ADRES ?? "",
      priceCapApplied: item.PARCPRC_ULS_AT === "Y",
      speculationOverheated: item.SPECLT_RDN_EARTH_AT === "Y",
      adjustmentTarget: item.MDAT_TRGET_AREA_SECD === "Y",
    };
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
