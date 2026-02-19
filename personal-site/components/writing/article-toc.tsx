"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

type TocHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function ArticleToc() {
  const pathname = usePathname();
  const [activeId, setActiveId] = useState<string>("");
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const desktopReady = useSyncExternalStore(
    (callback) => {
      if (!isClient) {
        return () => {};
      }
      const media = window.matchMedia("(min-width: 1280px)");
      const onChange = () => callback();
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => (isClient ? window.matchMedia("(min-width: 1280px)").matches : false),
    () => false,
  );

  useEffect(() => {
    if (!isClient || !desktopReady || typeof document === "undefined") {
      return;
    }

    const collectHeadings = (): TocHeading[] =>
      Array.from(
        document.querySelectorAll<HTMLElement>(
          'article[data-writing-article] h2[id], article[data-writing-article] h3[id]',
        ),
      )
        .map((node) => ({
          id: node.id,
          text: node.textContent?.trim() ?? "",
          level: (node.tagName === "H2" ? 2 : 3) as 2 | 3,
        }))
        .filter((item) => item.id && item.text);

    const update = () => {
      const next = collectHeadings();
      setHeadings(next);
    };

    const rafId = window.requestAnimationFrame(update);
    const article = document.querySelector<HTMLElement>("article[data-writing-article]");
    const observer = article
      ? new MutationObserver(() => update())
      : null;
    if (article && observer) {
      observer.observe(article, { childList: true, subtree: true });
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [desktopReady, isClient, pathname]);

  useEffect(() => {
    if (!headings.length) {
      return;
    }
    const nodes = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((node): node is HTMLElement => Boolean(node));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId((visible[0].target as HTMLElement).id);
        }
      },
      {
        root: null,
        rootMargin: "-22% 0px -65% 0px",
        threshold: [0, 1],
      },
    );

    for (const node of nodes) {
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (!isClient || !desktopReady || headings.length === 0 || typeof document === "undefined") {
    return null;
  }

  const highlightedId = activeId || headings[0].id;

  return createPortal(
    <aside
      aria-label="Table of contents"
      style={{
        position: "fixed",
        top: "7rem",
        right: "1.5rem",
        width: "14rem",
      }}
    >
      <p className="mb-3 text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase">On This Page</p>
      <nav>
        <ol className="m-0 space-y-2 p-0">
          {headings.map((heading, index) => (
            <li key={`${heading.id}-${index}`} className={heading.level === 3 ? "pl-3" : ""}>
              <Link
                href={`#${heading.id}`}
                className={`text-xs transition-colors ${
                  highlightedId === heading.id ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {heading.text}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </aside>,
    document.body,
  );
}
