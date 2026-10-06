"use client";

import { useSyncExternalStore } from "react";

export type SiteScheme = "light" | "dark";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-scheme"] });
  return () => observer.disconnect();
}

/** The resolved light/dark scheme the site's theme script writes to `<html data-scheme>`. */
export function useSiteScheme(): SiteScheme {
  return useSyncExternalStore(
    subscribe,
    () => (document.documentElement.dataset.scheme === "dark" ? "dark" : "light"),
    () => "light",
  );
}
