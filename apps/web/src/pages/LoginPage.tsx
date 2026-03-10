import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export function LoginPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // 이미 로그인된 경우 홈으로 이동
  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  function handleKakaoLogin() {
    window.location.href = `${API_BASE_URL}/auth/kakao`;
  }

  return (
    <div className="page-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "24px" }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ marginBottom: "8px" }}>로그인</h2>
        <p className="eyebrow" style={{ color: "var(--color-text-secondary)" }}>
          알림·관심 단지를 기기 간 동기화하려면 로그인하세요
        </p>
      </div>

      <button
        className="kakao-login-button"
        onClick={handleKakaoLogin}
        type="button"
      >
        <KakaoIcon />
        카카오로 시작하기
      </button>

      <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", textAlign: "center", maxWidth: "280px", lineHeight: "1.6" }}>
        로그인 없이도 분양 탐색, 점수 계산, 조건 진단 등 대부분의 기능을 사용할 수 있습니다.
      </p>
    </div>
  );
}

function KakaoIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 1C4.582 1 1 3.896 1 7.444c0 2.259 1.447 4.247 3.633 5.42L3.727 16.2a.25.25 0 00.373.27L8.14 13.86c.284.025.572.04.86.04 4.418 0 8-2.896 8-6.444C17 3.896 13.418 1 9 1z"
        fill="currentColor"
      />
    </svg>
  );
}
