"use client";

import dynamic from "next/dynamic";

const ImmersiveEntry = dynamic(() => import("./immersive-entry"), {
  ssr: false,
  loading: () => <div className="grid h-full w-full place-items-center text-xs text-[var(--text-muted)]">Loading…</div>,
});

export function ImmersiveLoader() {
  return <ImmersiveEntry />;
}
