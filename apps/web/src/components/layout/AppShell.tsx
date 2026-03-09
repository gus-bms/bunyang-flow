import { NavLink, Link } from "react-router-dom";
import type { PropsWithChildren } from "react";

import { usePreferenceStore } from "../../store/preferences";

const navItems = [
  { to: "/", label: "홈" },
  { to: "/offerings", label: "분양 찾기" },
  { to: "/schedule", label: "일정" },
  { to: "/saved", label: "관심" },
  { to: "/me", label: "마이" },
];

export function AppShell({ children }: PropsWithChildren) {
  const comparisonIds = usePreferenceStore((state) => state.comparisonIds);

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div>
          <p className="eyebrow">Bunyang Flow</p>
          <h1>분양과 청약 실행을 위한 흐름</h1>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {comparisonIds.length > 0 && (
            <Link
              to="/compare"
              className="secondary-link"
            >
              비교함
              <span className="compare-badge">{comparisonIds.length}</span>
            </Link>
          )}
          <NavLink
            className="secondary-link"
            to="/onboarding"
          >
            조건 설정
          </NavLink>
        </div>
      </header>
      <main className="app-main">{children}</main>
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "bottom-nav__item is-active" : "bottom-nav__item"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
