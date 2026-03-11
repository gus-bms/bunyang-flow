import type {
  EligibilityResult,
  OfferingDetail,
  OfferingStage,
  ScoreInput,
  ScoreResult,
  UserProfile,
} from "@bunyang-flow/shared";
import { useAuthStore } from "../store/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

function getAuthToken(): string | null {
  return useAuthStore.getState().token;
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  if (isRefreshing) return refreshPromise;

  isRefreshing = true;
  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) return null;
      return res.json() as Promise<{ accessToken: string }>;
    })
    .then((data) => {
      if (!data) return null;
      useAuthStore.getState().setToken(data.accessToken);
      return data.accessToken;
    })
    .catch(() => null)
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (response.status === 401 && token) {
    const newToken = await tryRefreshToken();
    if (!newToken) {
      useAuthStore.getState().logout();
      throw new Error("Session expired");
    }

    const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${newToken}`,
        ...(init?.headers ?? {}),
      },
      ...init,
    });

    if (!retryResponse.ok) {
      throw new Error(`Request failed: ${retryResponse.status}`);
    }

    return retryResponse.json() as Promise<T>;
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {});
  useAuthStore.getState().logout();
}

export interface OfferingsResponse {
  total: number;
  items: OfferingDetail[];
}

export interface ScheduleResponse {
  items: Array<{
    id: string;
    offeringId: string;
    complexName: string;
    label: string;
    date: string;
    status: string;
  }>;
}

export function getOfferings(params?: URLSearchParams) {
  const suffix = params?.toString() ? `?${params.toString()}` : "";
  return fetchJson<OfferingsResponse>(`/offerings${suffix}`);
}

export interface MapOffering {
  id: string;
  complexName: string;
  latitude: number;
  longitude: number;
  currentStage: OfferingStage;
  minSalePrice: number;
  nextScheduleLabel: string;
  nextScheduleAt: string;
}

export interface MapOfferingsParams {
  stages?: OfferingStage[];
  swLat?: number;
  swLng?: number;
  neLat?: number;
  neLng?: number;
}

export function getOfferingsForMap(filters?: MapOfferingsParams) {
  const p = new URLSearchParams();
  if (filters?.stages?.length) p.set("stages", filters.stages.join(","));
  if (filters?.swLat !== undefined) p.set("swLat", String(filters.swLat));
  if (filters?.swLng !== undefined) p.set("swLng", String(filters.swLng));
  if (filters?.neLat !== undefined) p.set("neLat", String(filters.neLat));
  if (filters?.neLng !== undefined) p.set("neLng", String(filters.neLng));
  const suffix = p.toString() ? `?${p.toString()}` : "";
  return fetchJson<{ total: number; items: MapOffering[] }>(`/offerings/map${suffix}`);
}

export function getOffering(id: string) {
  return fetchJson<OfferingDetail>(`/offerings/${id}`);
}

export interface CompetitionResult {
  isLive: boolean;
  lastUpdatedAt: string;
  rates: Array<{
    id: string;
    typeName: string;
    supplyKind: string;
    specialSupplyType?: string;
    recruitmentCount: number;
    applicantCount: number;
    competitionRatio: number;
    minWinningScore?: number;
    maxWinningScore?: number;
    avgWinningScore?: number;
  }>;
}

export function getCompetition(id: string) {
  return fetchJson<CompetitionResult>(`/offerings/${id}/competition`);
}

export function getSchedule(offeringIds?: string[]) {
  const params = new URLSearchParams();
  if (offeringIds?.length) {
    params.set("offeringIds", offeringIds.join(","));
  }

  const suffix = params.toString() ? `?${params.toString()}` : "";
  return fetchJson<ScheduleResponse>(`/schedule${suffix}`);
}

export function checkEligibility(input: UserProfile & { offeringId?: string }) {
  return fetchJson<EligibilityResult>("/eligibility/check", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function calculateScore(input: ScoreInput) {
  return fetchJson<ScoreResult>("/score/calculate", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getMyScore() {
  return fetchJson<ScoreResult>("/score/me");
}

// User Profile

export interface UserProfileData {
  residenceRegion1: string;
  residenceRegion2?: string;
  isHomeless: boolean;
  isHeadOfHousehold: boolean;
  hasSubscriptionAccount: boolean;
  subscriptionPeriodMonths: number;
  specialSupplyFlags: string[];
  budgetMax?: number;
}

export function getMyProfile() {
  return fetchJson<UserProfileData>("/users/me/profile");
}

export function putMyProfile(data: UserProfileData) {
  return fetchJson<UserProfileData>("/users/me/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function patchMyProfile(data: Partial<UserProfileData>) {
  return fetchJson<UserProfileData>("/users/me/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Interests

export interface InterestItem {
  offeringId: string;
  createdAt: string;
  offering: {
    id: string;
    complexName: string;
    regionLabel: string;
    currentStage: string;
    minSalePrice: number;
    nextScheduleLabel: string;
    nextScheduleAt: string;
  };
}

export function getInterests() {
  return fetchJson<{ items: InterestItem[] }>("/interests");
}

export function addInterest(offeringId: string) {
  return fetchJson<{ offeringId: string }>("/interests", {
    method: "POST",
    body: JSON.stringify({ offeringId }),
  });
}

export function removeInterest(offeringId: string) {
  return fetchJson<{ offeringId: string }>(`/interests/${encodeURIComponent(offeringId)}`, {
    method: "DELETE",
  });
}

// Alerts

export interface AlertItem {
  offeringId: string;
  eventTypes: string[];
  createdAt: string;
  offering: {
    id: string;
    complexName: string;
    regionLabel: string;
    currentStage: string;
  };
}

export function getAlerts() {
  return fetchJson<{ items: AlertItem[] }>("/alerts");
}

export function addAlert(offeringId: string, eventTypes: string[]) {
  return fetchJson<AlertItem>("/alerts", {
    method: "POST",
    body: JSON.stringify({ offeringId, eventTypes }),
  });
}

export function updateAlert(offeringId: string, eventTypes: string[]) {
  return fetchJson<AlertItem>(`/alerts/${encodeURIComponent(offeringId)}`, {
    method: "PATCH",
    body: JSON.stringify({ eventTypes }),
  });
}

export function removeAlert(offeringId: string) {
  return fetchJson<{ offeringId: string }>(`/alerts/${encodeURIComponent(offeringId)}`, {
    method: "DELETE",
  });
}
