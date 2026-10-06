"use client";

import { Canvas } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import { useState, useSyncExternalStore } from "react";
import { useAppReducedMotion } from "@/hooks/use-app-reduced-motion";
import { useImmersiveSupport } from "@/hooks/use-immersive-support";
import { ImmersiveScene } from "./scene";

export default function ImmersiveEntry() {
  const [store] = useState(() => createXRStore({ frameRate: "high", foveation: 0.4 }));
  const session = useSyncExternalStore(store.subscribe, () => store.getState().session, () => undefined);
  const emulated = useSyncExternalStore(store.subscribe, () => store.getState().emulator != null, () => false);
  const supported = useImmersiveSupport() || emulated;
  const reduceMotion = useAppReducedMotion(true);
  const [error, setError] = useState<string | null>(null);

  async function enter() {
    setError(null);
    try {
      await store.enterVR();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not start the immersive session.");
    }
  }

  return (
    <div className="relative h-[min(72svh,680px)] w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
      <Canvas camera={{ position: [0, 1.45, 0], fov: 62, near: 0.05, far: 200 }} dpr={[1, 2]} gl={{ antialias: true }}>
        <XR store={store}>
          <ImmersiveScene reduceMotion={reduceMotion} />
        </XR>
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-5">
        {supported ? (
          <button type="button" className="home-btn home-btn-primary pointer-events-auto" onClick={enter} disabled={session != null}>
            {session ? "In VR" : "Enter VR"}
          </button>
        ) : (
          <p className="rounded-full bg-white/80 px-4 py-2 text-center text-xs text-gray-600 backdrop-blur">
            Drag to look around. Open this page in a VR headset’s browser to step inside.
          </p>
        )}
        {error ? <p className="rounded-full bg-white/80 px-4 py-1 text-xs text-red-700" role="alert">{error}</p> : null}
      </div>
    </div>
  );
}
