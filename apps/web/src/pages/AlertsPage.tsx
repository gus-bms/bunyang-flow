import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { StageBadge } from "../components/offerings/StageBadge";
import { getOfferings } from "../lib/api";
import { formatDate } from "../lib/format";
import { usePreferenceStore } from "../store/preferences";
import { useAuthStore } from "../store/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

async function registerPush(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const keyRes = await fetch(`${API_BASE_URL}/notifications/vapid-public-key`);
  const { publicKey } = await keyRes.json() as { publicKey: string };
  if (!publicKey) return false;

  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  const token = useAuthStore.getState().token;
  await fetch(`${API_BASE_URL}/notifications/subscribe`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(sub.toJSON()),
  });
  return true;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array(rawData.length).map((_, i) => rawData.charCodeAt(i));
}

export function AlertsPage() {
  const savedOfferingIds = usePreferenceStore((s) => s.savedOfferingIds);
  const alertedOfferingIds = usePreferenceStore((s) => s.alertedOfferingIds);
  const toggleAlert = usePreferenceStore((s) => s.toggleAlert);
  const user = useAuthStore((s) => s.user);
  const [pushStatus, setPushStatus] = useState<"idle" | "loading" | "done" | "failed">("idle");

  const { data } = useQuery({
    queryKey: ["offerings", "alerts"],
    queryFn: () => getOfferings(),
    enabled: savedOfferingIds.length > 0,
  });

  const savedOfferings = (data?.items ?? []).filter((o) => savedOfferingIds.includes(o.id));

  async function handleEnablePush() {
    if (!user) return;
    setPushStatus("loading");
    const ok = await registerPush().catch(() => false);
    setPushStatus(ok ? "done" : "failed");
  }

  return (
    <div className="page-stack">
      <div style={{ padding: "16px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>알림</h2>
        <Link to="/schedule" style={{ fontSize: 15, color: "var(--c-blue)", fontWeight: 500 }}>일정</Link>
      </div>

      {/* 푸시 알림 */}
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-label3)", textTransform: "uppercase" as const, letterSpacing: "0.05em", padding: "16px 16px 6px" }}>
        푸시 알림
      </div>
      <div className="inset-group">
        {!user ? (
          <div className="inset-group__row">
            <span className="inset-group__label">로그인 필요</span>
            <Link to="/login" style={{ color: "var(--c-blue)", fontSize: 15 }}>로그인</Link>
          </div>
        ) : pushStatus === "done" ? (
          <div className="inset-group__row">
            <span className="inset-group__label" style={{ color: "var(--c-green)" }}>푸시 알림 활성화됨</span>
          </div>
        ) : (
          <button
            type="button"
            className="inset-group__row"
            onClick={handleEnablePush}
            disabled={pushStatus === "loading"}
            style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
          >
            <span style={{ color: "var(--c-blue)", fontSize: 15 }}>
              {pushStatus === "loading" ? "처리 중..." : "푸시 알림 허용하기"}
            </span>
            <span style={{ color: "var(--c-label4)" }}>›</span>
          </button>
        )}
        {pushStatus === "failed" && (
          <div className="inset-group__row">
            <span style={{ color: "var(--c-red)", fontSize: 13 }}>브라우저 알림 설정을 확인하세요</span>
          </div>
        )}
      </div>

      {/* 단지별 알림 */}
      {savedOfferingIds.length === 0 ? (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-label3)", textTransform: "uppercase" as const, letterSpacing: "0.05em", padding: "16px 16px 6px" }}>
            관심 단지
          </div>
          <div style={{ margin: "0 16px", background: "var(--c-surface)", borderRadius: 14, padding: "40px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 15, color: "var(--c-label3)", margin: "0 0 12px" }}>저장한 단지가 없습니다</p>
            <Link to="/offerings" style={{ fontSize: 15, color: "var(--c-blue)", fontWeight: 500 }}>분양 찾기</Link>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-label3)", textTransform: "uppercase" as const, letterSpacing: "0.05em", padding: "16px 16px 6px" }}>
            관심 단지별 알림
          </div>
          <div className="inset-group">
            {savedOfferings.map((offering) => {
              const isAlerted = alertedOfferingIds.includes(offering.id);
              return (
                <div key={offering.id} className="inset-group__row" style={{ gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <StageBadge stage={offering.currentStage} />
                    </div>
                    <Link to={`/offerings/${offering.id}`} style={{ fontSize: 15, fontWeight: 600 }}>
                      {offering.complexName}
                    </Link>
                    <div style={{ fontSize: 13, color: "var(--c-label3)", marginTop: 1 }}>
                      {offering.nextScheduleLabel} · {formatDate(offering.nextScheduleAt)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={isAlerted ? "toggle-switch toggle-switch--on" : "toggle-switch"}
                    onClick={() => toggleAlert(offering.id)}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}

      <div style={{ height: 16 }} />
    </div>
  );
}
