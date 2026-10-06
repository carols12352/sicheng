import { createContext, useContext } from "react";
import type { SiteScheme } from "@/hooks/use-site-scheme";

/** Mirrors the site's CSS tokens in app/globals.css so the space reads as the same site. */
export type Theme = {
  scheme: SiteScheme;
  skyTop: string;
  horizon: string;
  floor: string;
  floorLine: string;
  surface: string;
  line: string;
  lineStrong: string;
  text: string;
  strong: string;
  muted: string;
  accent: string;
  /** Physical objects and the plinth, lifted off the background so they read as solid. */
  object: string;
  plinth: string;
};

export const themes: Record<SiteScheme, Theme> = {
  dark: {
    scheme: "dark",
    skyTop: "#0e0e0e",
    horizon: "#1d1e21",
    floor: "#111111",
    floorLine: "#2f3033",
    surface: "#171717",
    line: "#2a2a2a",
    lineStrong: "#373737",
    text: "#c4cad3",
    strong: "#f3f4f6",
    muted: "#9aa3af",
    accent: "#7aa2e3",
    object: "#3a3d43",
    plinth: "#1f2023",
  },
  light: {
    scheme: "light",
    skyTop: "#eef0f3",
    horizon: "#ffffff",
    floor: "#f3f4f6",
    floorLine: "#d1d5db",
    surface: "#ffffff",
    line: "#e5e7eb",
    lineStrong: "#d1d5db",
    text: "#4b5563",
    strong: "#111827",
    muted: "#9ca3af",
    accent: "#2f5fa7",
    object: "#f3f4f6",
    plinth: "#ffffff",
  },
};

export const ThemeContext = createContext<Theme>(themes.light);

export function useTheme() {
  return useContext(ThemeContext);
}
