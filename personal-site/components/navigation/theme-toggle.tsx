"use client";

import { useEffect, useSyncExternalStore } from "react";

type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "site-theme-mode";

function resolveSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const resolvedTheme = mode === "system" ? resolveSystemTheme() : mode;
  root.dataset.theme = mode;
  root.dataset.scheme = resolvedTheme;
  root.style.colorScheme = resolvedTheme;
}

function withThemeTransition(update: () => void) {
  const root = document.documentElement;
  const still = root.dataset.motion !== "full" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || still) {
    update();
    return;
  }
  document.startViewTransition(update);
}

export function ThemeToggle() {
  const modes = ["light", "dark", "system"] as const;
  const mode = useSyncExternalStore<ThemeMode>(
    (callback) => {
      window.addEventListener("storage", callback);
      window.addEventListener("site:theme-pref-changed", callback);
      return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener("site:theme-pref-changed", callback);
      };
    },
    (): ThemeMode => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved === "light" || saved === "dark" || saved === "system"
        ? saved
        : "system";
    },
    (): ThemeMode => "system",
  );

  useEffect(() => {
    const initialSaved = window.localStorage.getItem(STORAGE_KEY);
    if (!(initialSaved === "light" || initialSaved === "dark" || initialSaved === "system")) {
      window.localStorage.setItem(STORAGE_KEY, "system");
    }
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const normalized: ThemeMode =
      saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
    applyTheme(normalized);
  }, []);

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  const handleSelect = (nextMode: ThemeMode) => {
    window.localStorage.setItem(STORAGE_KEY, nextMode);
    // The old snapshot must be taken before anything, including the store listeners, repaints.
    withThemeTransition(() => {
      applyTheme(nextMode);
      window.dispatchEvent(new Event("site:theme-pref-changed"));
    });
  };

  return (
    <div className="theme-toggle">
      {modes.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => handleSelect(item)}
          className={`theme-toggle-btn ${mode === item ? "theme-toggle-btn-active" : ""}`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
