"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

export function useModelElementSupport(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => "HTMLModelElement" in window,
    () => false,
  );
}

export function useImmersiveSupport(): boolean {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    let active = true;
    navigator.xr
      ?.isSessionSupported("immersive-vr")
      .then((value) => {
        if (active) setSupported(value);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return supported;
}
