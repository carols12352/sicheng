"use client";

import dynamic from "next/dynamic";

const ImmersiveEntry = dynamic(() => import("./immersive-entry"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[min(72svh,680px)] w-full place-items-center rounded-2xl border border-gray-200 bg-gray-100 text-sm text-gray-500">
      Loading the space…
    </div>
  ),
});

export function ImmersiveLoader() {
  return <ImmersiveEntry />;
}
