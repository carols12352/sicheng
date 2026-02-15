import type { ReactNode } from "react";

type ProseProps = {
  children: ReactNode;
};

export function Prose({ children }: ProseProps) {
  return (
    <div className="mx-auto max-w-[44rem] text-[1.02rem] leading-[1.9] text-gray-700 [&>p:first-of-type]:mt-8 [&>p:first-of-type]:text-[1.08rem]">
      {children}
    </div>
  );
}
