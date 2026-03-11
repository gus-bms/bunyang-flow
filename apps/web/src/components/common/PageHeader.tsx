import type { PropsWithChildren } from "react";

export function PageHeader({
  title,
  description,
  action,
}: PropsWithChildren<{
  title: string;
  description?: string;
  action?: React.ReactNode;
}>) {
  return (
    <section className="page-header">
      <div style={{ display: "grid", gap: 2 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.4px" }}>
          {title}
        </h2>
        {description && (
          <p style={{ fontSize: 14, color: "var(--c-label3)", margin: 0 }}>{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </section>
  );
}
