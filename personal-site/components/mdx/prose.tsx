import type { ReactNode } from "react";

type ProseProps = {
  children: ReactNode;
};

export function Prose({ children }: ProseProps) {
  return (
    <div className="mdx-prose mx-auto max-w-[40rem] font-sans text-gray-700">
      {children}
    </div>
  );
}
