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

export function MapShell({ children }: PropsWithChildren) {
  const comparisonIds = usePreferenceStore((s) => s.comparisonIds);
  const user = useAuthStore((s) => s.user);

  return (
    <div className="map-shell">
      <header className="map-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link to="/offerings" className="map-topbar__back" title="리스트로 돌아가기">
            ← 리스트
          </Link>
          <span className="map-topbar__title">지도 뷰</span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {comparisonIds.length > 0 && (
            <Link to="/compare" className="secondary-link" style={{ padding: "6px 12px", fontSize: "13px" }}>
              비교함<span className="compare-badge">{comparisonIds.length}</span>
            </Link>
          )}
          {!user && (
            <Link to="/login" className="kakao-login-button kakao-login-button--small">
              로그인
            </Link>
          )}
        </div>
      </header>
      <main className="map-main">{children}</main>
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
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
