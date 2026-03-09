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
      <div>
        <p className="eyebrow">MVP</p>
        <h2>{title}</h2>
        {description ? <p className="muted">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </section>
  );
}
