import type {
  EligibilityResult,
  OfferingDetail,
  ScoreInput,
  ScoreResult,
  UserProfile,
} from "@bunyang-flow/shared";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem("bunyang-flow-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string } };
    return parsed.state?.token ?? null;
  } catch {
    return null;
  }
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
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

export function getOffering(id: string) {
  return fetchJson<OfferingDetail>(`/offerings/${id}`);
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
