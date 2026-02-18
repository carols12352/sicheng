import type { ReactNode } from "react";

type SidenoteProps = {
  children: ReactNode;
  label?: string;
};

export function Sidenote({ children, label = "Note" }: SidenoteProps) {
  return (
    <aside className="sidenote" role="note" aria-label={label}>
      <p className="sidenote-label">{label}</p>
      <div>{children}</div>
    </aside>
  );
}
