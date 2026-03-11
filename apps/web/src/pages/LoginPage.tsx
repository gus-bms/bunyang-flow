import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export function LoginPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  function handleKakaoLogin() {
    window.location.href = `${API_BASE_URL}/auth/kakao`;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "24px 24px 48px", background: "var(--c-bg)" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🏠</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.5px" }}>분양플로우</h2>
        <p style={{ fontSize: 15, color: "var(--c-label3)", margin: 0, lineHeight: 1.6 }}>
          알림·관심 단지를 기기 간 동기화하려면 로그인하세요
        </p>
      </div>

      <button
        className="kakao-login-button"
        onClick={handleKakaoLogin}
        type="button"
        style={{ width: "100%", maxWidth: 320, justifyContent: "center" }}
      >
        <KakaoIcon />
        카카오로 시작하기
      </button>

      <p style={{ fontSize: 13, color: "var(--c-label4)", textAlign: "center", maxWidth: 280, lineHeight: 1.6, marginTop: 20 }}>
        로그인 없이도 분양 탐색, 점수 계산, 조건 진단 등 대부분의 기능을 사용할 수 있습니다.
      </p>
    </div>
  );
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 1C4.582 1 1 3.896 1 7.444c0 2.259 1.447 4.247 3.633 5.42L3.727 16.2a.25.25 0 00.373.27L8.14 13.86c.284.025.572.04.86.04 4.418 0 8-2.896 8-6.444C17 3.896 13.418 1 9 1z"
        fill="currentColor"
      />
    </svg>
  );
}
