import { NavLink, Link } from "react-router-dom";
import type { PropsWithChildren } from "react";

import { usePreferenceStore } from "../../store/preferences";
import { useAuthStore } from "../../store/auth";

const navItems = [
  { to: "/", label: "홈", icon: "⌂" },
  { to: "/offerings", label: "분양", icon: "◫" },
  { to: "/schedule", label: "일정", icon: "◷" },
  { to: "/saved", label: "관심", icon: "♡" },
  { to: "/me", label: "마이", icon: "◉" },
];

export function AppShell({ children }: PropsWithChildren) {
  const comparisonIds = usePreferenceStore((state) => state.comparisonIds);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <h1>분양플로우</h1>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {comparisonIds.length > 0 && (
            <Link to="/compare" style={{ fontSize: 15, color: "var(--c-blue)", fontWeight: 500 }}>
              비교함
              <span className="compare-badge">{comparisonIds.length}</span>
            </Link>
          )}
          {user ? (
            <div className="auth-user">
              {user.profileImageUrl && (
                <img
                  src={user.profileImageUrl}
                  alt={user.nickname}
                  className="auth-user__avatar"
                />
              )}
              <span className="auth-user__name">{user.nickname}</span>
              <button
                type="button"
                onClick={logout}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 14, color: "var(--c-red)", fontWeight: 500 }}
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="kakao-login-button kakao-login-button--small"
            >
              카카오 로그인
            </Link>
          )}
        </div>
      </header>
      <main className="app-main">{children}</main>
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              isActive ? "bottom-nav__item is-active" : "bottom-nav__item"
            }
          >
            <span className="bottom-nav__icon" aria-hidden="true">{item.icon}</span>
            <span className="bottom-nav__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
