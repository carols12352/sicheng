"use client";

import { useEffect, useState } from "react";

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
