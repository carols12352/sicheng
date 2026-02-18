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
  const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? process.env.NEXT_PUBLIC_GIT_COMMIT_SHA ?? "";
  const shortSha = commitSha ? commitSha.slice(0, 7) : "local";
  const commitHref = commitSha
    ? `https://github.com/carols12352/sicheng/commit/${commitSha}`
    : "https://github.com/carols12352/sicheng/commits";

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
    <>
      <p className="mt-4 font-mono text-[11px] text-gray-500">
        <a href="/terminal" className="ui-link ui-underline">
          Last login: <span suppressHydrationWarning>{lastLogin}</span> on ttys001
        </a>
        {showCursor ? <span className="terminal-caret ml-1" aria-hidden /> : null}
      </p>
      <p className="mt-2 font-mono text-[11px] text-gray-500">
        Tip: <span className="text-gray-600">?</span> shortcuts,{" "}
        <span className="text-gray-600">j</span>/<span className="text-gray-600">k</span> scroll,{" "}
        <span className="text-gray-600">/</span> search (Writing/Projects/Article)
      </p>
      <p className="mt-2 flex items-center gap-2 font-mono text-[11px] text-gray-500">
        <span className="build-status-dot" aria-hidden />
        <a href={commitHref} target="_blank" rel="noreferrer" className="ui-link ui-underline">
          build {shortSha}
        </a>
      </p>
    </>
  );
}
