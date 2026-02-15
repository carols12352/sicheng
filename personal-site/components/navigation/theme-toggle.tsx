"use client";

import { useEffect, useState } from "react";

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
  root.style.colorScheme = resolvedTheme;
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" || saved === "system"
      ? saved
      : "system";
  });

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const onChange = () => {
      if (mode === "system") {
        applyTheme("system");
      }
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode]);

  const handleSelect = (nextMode: ThemeMode) => {
    setMode(nextMode);
    window.localStorage.setItem(STORAGE_KEY, nextMode);
    applyTheme(nextMode);
  };

  return (
    <div className="theme-toggle" role="group" aria-label="Theme selector">
      {(["light", "dark", "system"] as const).map((item) => (
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
