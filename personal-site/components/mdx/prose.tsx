import type { ReactNode } from "react";

type ProseProps = {
  children: ReactNode;
};

export function Prose({ children }: ProseProps) {
  return (
    <div className="mx-auto max-w-[42.5rem] font-serif text-[1.04rem] leading-[1.85] text-gray-700">
      {children}
    </div>
  );
}
