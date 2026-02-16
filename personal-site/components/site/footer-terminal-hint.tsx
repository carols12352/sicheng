"use client";

import { useEffect, useState } from "react";

function formatLastLogin(date: Date): string {
  return date.toLocaleString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function FooterTerminalHint() {
  const lastLogin = formatLastLogin(new Date());
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollBottom = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      setShowCursor(scrollBottom >= docHeight - 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <p className="mt-4 font-mono text-[11px] text-gray-500">
      <a href="/terminal" className="ui-link ui-underline">
        Last login: <span suppressHydrationWarning>{lastLogin}</span> on ttys001
      </a>
      {showCursor ? <span className="terminal-caret ml-1" aria-hidden /> : null}
    </p>
  );
}
