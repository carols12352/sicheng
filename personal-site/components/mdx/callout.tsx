import type { ReactNode } from "react";

type CalloutType = "note" | "warning" | "idea";

type CalloutProps = {
  type?: CalloutType;
  children: ReactNode;
};

const styles: Record<CalloutType, { container: string; label: string }> = {
  note: {
    container: "border-gray-300 bg-gray-50",
    label: "text-gray-600",
  },
  warning: {
    container: "border-gray-500 bg-gray-100",
    label: "text-gray-700",
  },
  idea: {
    container: "border-gray-400 bg-gray-50",
    label: "text-gray-700",
  },
};

export function Callout({ type = "note", children }: CalloutProps) {
  const style = styles[type];

  return (
    <aside className={`mt-6 rounded-md border-l-2 px-4 py-3 ${style.container}`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${style.label}`}>
        {type}
      </p>
      <div className="mt-2 text-sm leading-7 text-gray-700">{children}</div>
    </aside>
  );
}
