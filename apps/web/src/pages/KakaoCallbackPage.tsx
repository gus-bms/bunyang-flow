import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export function KakaoCallbackPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setError("인증 토큰이 없습니다. 다시 시도해 주세요.");
      return;
    }

    // 토큰으로 사용자 정보 조회
    fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("사용자 정보 조회 실패");
        return res.json();
      })
      .then((user) => {
        login(user, token);
        navigate("/", { replace: true });
      })
      .catch(() => {
        setError("로그인 처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
      });
  }, [login, navigate]);

  if (error) {
    return (
      <div className="page-content" style={{ textAlign: "center", padding: "48px 24px" }}>
        <p style={{ color: "var(--color-danger, #e53e3e)", marginBottom: "16px" }}>{error}</p>
        <a href="/login" className="secondary-link">로그인 페이지로 돌아가기</a>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ textAlign: "center", padding: "48px 24px" }}>
      <p style={{ color: "var(--color-text-secondary)" }}>카카오 로그인 처리 중...</p>
    </div>
  );
}
