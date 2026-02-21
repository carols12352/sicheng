"use client";

import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState } from "react";

const CONSENT_KEY = "site-cookie-consent";

function readConsentCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie.match(/(?:^|;\s*)site-cookie-consent=(accepted|rejected)(?:;|$)/);
  return match?.[1] ?? null;
}

export function AnalyticsConsentGate() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const apply = () => {
      let saved: string | null = null;
      try {
        saved = window.localStorage.getItem(CONSENT_KEY);
      } catch {
        saved = readConsentCookie();
      }
      if (saved !== "accepted" && saved !== "rejected") {
        saved = readConsentCookie();
      }
      const accepted = saved === "accepted";
      setEnabled(accepted);
      document.documentElement.dataset.cookieConsent = accepted ? "accepted" : saved === "rejected" ? "rejected" : "pending";
    };

    apply();
    window.addEventListener("site:cookie-consent-changed", apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener("site:cookie-consent-changed", apply);
      window.removeEventListener("storage", apply);
    };
  }, []);

  return enabled ? <Analytics /> : null;
}
