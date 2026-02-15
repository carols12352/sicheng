"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "site-theme-mode";
const FAVICON_BY_THEME = {
  light: "/favicon-light.ico",
  dark: "/favicon-dark.ico",
} as const;

function resolveSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyFavicon(theme: "light" | "dark") {
  const head = document.head;
  if (!head) return;

  let icon = head.querySelector<HTMLLinkElement>('link[data-dynamic-favicon="true"]');
  if (!icon) {
    icon = document.createElement("link");
    icon.rel = "icon";
    icon.type = "image/x-icon";
    icon.dataset.dynamicFavicon = "true";
    head.appendChild(icon);
  }

  icon.href = FAVICON_BY_THEME[theme];
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const resolvedTheme = mode === "system" ? resolveSystemTheme() : mode;
  root.dataset.theme = mode;
  root.style.colorScheme = resolvedTheme;
  applyFavicon(resolvedTheme);
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const initial: ThemeMode =
      saved === "light" || saved === "dark" || saved === "system"
        ? saved
        : "system";

    setMode(initial);
    applyTheme(initial);
  }, []);

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
