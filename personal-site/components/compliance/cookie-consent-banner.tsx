"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_KEY = "site-cookie-consent";
type ConsentValue = "accepted" | "rejected";

function readConsentFromCookie(): ConsentValue | null {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie.match(/(?:^|;\s*)site-cookie-consent=(accepted|rejected)(?:;|$)/);
  return match?.[1] === "accepted" || match?.[1] === "rejected" ? (match[1] as ConsentValue) : null;
}

function readConsent(): ConsentValue | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const saved = window.localStorage.getItem(CONSENT_KEY);
    if (saved === "accepted" || saved === "rejected") {
      return saved;
    }
  } catch {
    // Fallback to cookie below.
  }
  return readConsentFromCookie();
}

export function CookieConsentBanner() {
  const [hydrated, setHydrated] = useState(false);
  const [consent, setConsent] = useState<ConsentValue | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setConsent(readConsent());
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    document.documentElement.dataset.cookieConsent = consent ?? "pending";
  }, [consent, hydrated]);

  const setDecision = (value: ConsentValue) => {
    setConsent(value);
    document.documentElement.dataset.cookieConsent = value;
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // Ignore storage failures (private mode / restricted storage).
    }
    try {
      document.cookie = `${CONSENT_KEY}=${value}; Path=/; Max-Age=${60 * 60 * 24 * 180}; SameSite=Lax`;
    } catch {
      // Ignore cookie failures.
    }
    window.dispatchEvent(new Event("site:cookie-consent-changed"));
  };

  if (!hydrated || consent) {
    return null;
  }

  return (
    <aside className="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">
      <p className="cookie-banner-text">
        This site uses cookies and analytics tools (including Google Analytics) to improve performance.
        See{" "}
        <Link href="/privacy" className="ui-link ui-underline">
          Privacy Policy
        </Link>
        .
      </p>
      <div className="cookie-banner-actions">
        <button type="button" className="cookie-btn cookie-btn-secondary" onClick={() => setDecision("rejected")}>
          Reject
        </button>
        <button type="button" className="cookie-btn cookie-btn-primary" onClick={() => setDecision("accepted")}>
          Accept
        </button>
      </div>
    </aside>
  );
}
