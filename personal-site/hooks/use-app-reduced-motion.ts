"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

export function useAppReducedMotion(): boolean {
  const systemReducedMotion = useReducedMotion() ?? false;
  const appReducedMotion = useSyncExternalStore(
    (callback) => {
      window.addEventListener("site:motion-pref-changed", callback);
      window.addEventListener("storage", callback);
      return () => {
        window.removeEventListener("site:motion-pref-changed", callback);
        window.removeEventListener("storage", callback);
      };
    },
    () => document.documentElement.dataset.reduceMotion === "true",
    () => false,
  );

  return systemReducedMotion || appReducedMotion;
}
