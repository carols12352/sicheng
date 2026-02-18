"use client";

import { useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "site-reduce-motion";

function applyReduceMotion(enabled: boolean) {
  const root = document.documentElement;
  root.dataset.reduceMotion = enabled ? "true" : "false";
  window.dispatchEvent(new Event("site:motion-pref-changed"));
}

export function MotionToggle() {
  const enabled = useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      window.addEventListener("site:motion-pref-changed", callback);
      return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener("site:motion-pref-changed", callback);
      };
    },
    () => window.localStorage.getItem(STORAGE_KEY) === "true",
    () => false,
  );

  useEffect(() => {
    applyReduceMotion(enabled);
  }, [enabled]);

  const onToggle = () => {
    const next = !enabled;
    window.localStorage.setItem(STORAGE_KEY, next ? "true" : "false");
    window.dispatchEvent(new Event("site:motion-pref-changed"));
    applyReduceMotion(next);
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      className="motion-toggle ui-link"
      aria-pressed={enabled}
      aria-label={enabled ? "Enable full motion" : "Reduce motion"}
      title={enabled ? "Reduce motion: On" : "Reduce motion: Off"}
    >
      Motion: {enabled ? "Reduced" : "Full"}
    </button>
  );
}
