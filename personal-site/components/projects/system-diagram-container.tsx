import type { ReactNode } from "react";

type SystemDiagramContainerProps = {
  title: string;
  caption?: string;
  children: ReactNode;
};

export function SystemDiagramContainer({
  title,
  caption,
  children,
}: SystemDiagramContainerProps) {
  return (
    <figure className="system-diagram mt-4">
      <figcaption className="system-diagram-head">
        <span className="system-diagram-title">{title}</span>
        {caption ? <span className="system-diagram-caption">{caption}</span> : null}
      </figcaption>
      <div className="system-diagram-canvas">{children}</div>
    </figure>
  );
}
