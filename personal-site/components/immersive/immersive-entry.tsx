"use client";

import { Canvas } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useAppReducedMotion } from "@/hooks/use-app-reduced-motion";
import { useImmersiveSupport } from "@/hooks/use-immersive-support";
import { useSiteScheme } from "@/hooks/use-site-scheme";
import { PREVIEW_FOV, ImmersiveScene } from "./scene";
import { EYE_HEIGHT, resetSceneState } from "./scene-state";

export default function ImmersiveEntry() {
  const [store] = useState(() => createXRStore({ frameRate: "high", foveation: 0.4 }));
  const session = useSyncExternalStore(store.subscribe, () => store.getState().session, () => undefined);
  const emulated = useSyncExternalStore(store.subscribe, () => store.getState().emulator != null, () => false);
  const supported = useImmersiveSupport() || emulated;
  const reduceMotion = useAppReducedMotion(true);
  const scheme = useSiteScheme();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    resetSceneState();
  }, []);

  async function enter() {
    setError(null);
    try {
      await store.enterVR();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not start VR.");
    }
  }

  return (
    <div className="relative h-full w-full select-none">
      <Canvas
        camera={{ position: [0, EYE_HEIGHT, 0], fov: PREVIEW_FOV, near: 0.05, far: 200 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        style={{ touchAction: "none" }}
      >
        <XR store={store}>
          <ImmersiveScene reduceMotion={reduceMotion} scheme={scheme} />
        </XR>
      </Canvas>
      <Link
        href="/"
        className="home-btn home-btn-ghost absolute left-4 top-4 bg-[var(--bg)]"
      >
        ← Back
      </Link>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-6">
        {supported ? (
          <button
            type="button"
            className="home-btn home-btn-primary pointer-events-auto disabled:opacity-60"
            onClick={enter}
            disabled={session != null}
          >
            {session ? "In VR" : "Enter VR"}
          </button>
        ) : (
          <p className="text-center text-xs text-[var(--text-muted)]">Drag to look around, scroll or pinch to zoom</p>
        )}
        {error ? <p className="text-xs text-red-500" role="alert">{error}</p> : null}
      </div>
    </div>
  );
}
