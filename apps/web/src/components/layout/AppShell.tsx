import { NavLink } from "react-router-dom";
import type { PropsWithChildren } from "react";

const navItems = [
  { to: "/", label: "홈" },
  { to: "/offerings", label: "분양 찾기" },
  { to: "/schedule", label: "일정" },
  { to: "/saved", label: "관심" },
  { to: "/me", label: "마이" },
];

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div>
          <p className="eyebrow">Bunyang Flow</p>
          <h1>분양과 청약 실행을 위한 흐름</h1>
        </div>
        <NavLink
          className="secondary-link"
          to="/onboarding"
        >
          조건 설정
        </NavLink>
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
