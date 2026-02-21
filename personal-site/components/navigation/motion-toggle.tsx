"use client";

import { useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "site-motion-mode";
type MotionMode = "full" | "reduced" | "none";

function normalizeMode(value: string | null): MotionMode {
  if (value === "none" || value === "reduced" || value === "full") {
    return value;
  }
  // Backward compatibility with previous boolean key.
  if (window.localStorage.getItem("site-reduce-motion") === "true") {
    return "reduced";
  }
  return "full";
}

function applyMotionMode(mode: MotionMode) {
  const root = document.documentElement;
  root.dataset.motion = mode;
  root.dataset.reduceMotion = mode === "none" ? "true" : "false";
  window.dispatchEvent(new Event("site:motion-pref-changed"));
}

export function MotionToggle() {
  const mode = useSyncExternalStore<MotionMode>(
    (callback) => {
      window.addEventListener("storage", callback);
      window.addEventListener("site:motion-pref-changed", callback);
      return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener("site:motion-pref-changed", callback);
      };
    },
    () => normalizeMode(window.localStorage.getItem(STORAGE_KEY)),
    () => "full",
  );

  useEffect(() => {
    applyMotionMode(mode);
  }, [mode]);

  const onToggle = () => {
    const next: MotionMode = mode === "full" ? "reduced" : mode === "reduced" ? "none" : "full";
    window.localStorage.setItem(STORAGE_KEY, next);
    applyMotionMode(next);
  };

  const label = mode === "full" ? "Full" : mode === "reduced" ? "Reduced" : "None";

  return (
    <button
      type="button"
      onClick={onToggle}
      className="motion-toggle ui-link"
      title={`Motion: ${label}`}
    >
      Motion: {label}
    </button>
  );
}
