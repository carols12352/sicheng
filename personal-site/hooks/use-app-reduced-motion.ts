"use client";

import { useSyncExternalStore } from "react";

export function useAppReducedMotion(decorative = false): boolean {
  // Use the server snapshot during hydration so motion wrappers have identical markup.
  const systemReducedMotion = useSyncExternalStore(
    (callback) => {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
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

  return appMotionMode === "none" || systemReducedMotion || (decorative && appMotionMode === "reduced");
}
