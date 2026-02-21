"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

export function useAppReducedMotion(): boolean {
  const systemReducedMotion = useReducedMotion() ?? false;
  const appMotionMode = useSyncExternalStore<"full" | "reduced" | "none">(
    (callback) => {
      window.addEventListener("site:motion-pref-changed", callback);
      window.addEventListener("storage", callback);
      return () => {
        window.removeEventListener("site:motion-pref-changed", callback);
        window.removeEventListener("storage", callback);
      };
    },
    () => {
      const value = document.documentElement.dataset.motion;
      if (value === "none" || value === "reduced" || value === "full") {
        return value;
      }
      return document.documentElement.dataset.reduceMotion === "true" ? "reduced" : "full";
    },
    () => "full",
  );

  return appMotionMode === "none" || systemReducedMotion;
}
