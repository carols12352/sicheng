"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PageTransition } from "@/components/motion/page-transition";
import { NavLink } from "@/components/navigation/nav-link";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { FooterTerminalHint } from "@/components/site/footer-terminal-hint";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/resume", label: "Resume" },
  { href: "/projects", label: "Projects" },
  { href: "/writing", label: "Writing" },
  { href: "/about", label: "About" },
  { href: "/terminal", label: ">_" },
];

type SiteFrameProps = {
  children: React.ReactNode;
};

export function SiteFrame({ children }: SiteFrameProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isTerminalPage = pathname === "/terminal";
  const isWritingListPage = pathname === "/writing";
  const isProjectsPage = pathname === "/projects";
  const isWritingArticlePage = /^\/writing\/[^/]+$/.test(pathname);
  const canOpenSearch = isWritingArticlePage || isWritingListPage || isProjectsPage;
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResultCount, setSearchResultCount] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }
      const tagName = target.tagName.toLowerCase();
      return tagName === "input" || tagName === "textarea" || target.isContentEditable;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) {
        return;
      }

      if (event.key === "?" || (event.key === "/" && event.shiftKey)) {
        event.preventDefault();
        setShowShortcutHelp((prev) => !prev);
        return;
      }

      if (event.key === "Escape") {
        setShowShortcutHelp(false);
        setShowSearch(false);
        return;
      }

      if (event.key === "/") {
        if (!canOpenSearch) {
          return;
        }
        event.preventDefault();
        setSearchQuery("");
        setSearchResultCount(null);
        setShowSearch(true);
        window.requestAnimationFrame(() => {
          searchInputRef.current?.focus();
        });
        return;
      }

      if (event.key === "j" || event.key === "k") {
        event.preventDefault();
        window.scrollBy({
          top: event.key === "j" ? 120 : -120,
          behavior: "smooth",
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canOpenSearch]);

  useEffect(() => {
    const onSearchResult = (event: Event) => {
      const detail = (event as CustomEvent<{ query: string; count: number }>).detail;
      if (detail.query === searchQuery.trim()) {
        setSearchResultCount(detail.count);
      }
    };
    window.addEventListener("site:article-search-result", onSearchResult as EventListener);
    return () => window.removeEventListener("site:article-search-result", onSearchResult as EventListener);
  }, [searchQuery]);

  const dispatchArticleSearch = (value: string) => {
    const query = value.trim();
    setSearchQuery(value);
    if (!isWritingArticlePage) {
      return;
    }
    window.dispatchEvent(
      new CustomEvent("site:article-search", {
        detail: { query },
      }),
    );
  };

  if (isTerminalPage) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10 sm:py-12">
      <header>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="site-brand ui-link" aria-label="Sicheng Ouyang Home">
            <Image
              src="/favicon-light.png"
              alt="Sicheng logo light"
              width={28}
              height={28}
              className="site-logo site-logo-light"
            />
            <Image
              src="/favicon-dark.png"
              alt="Sicheng logo dark"
              width={28}
              height={28}
              className="site-logo site-logo-dark"
            />
            <span className="text-sm font-semibold text-gray-900">Sicheng Ouyang</span>
          </Link>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main className="mt-12 flex-1">
        <PageTransition>{children}</PageTransition>
      </main>

      <footer className="mt-24 border-t border-gray-200 pt-8 pb-2 text-sm text-gray-500">
        <p className="site-brand font-semibold text-gray-900">
          <Image
            src="/favicon-light.png"
            alt="Sicheng logo light"
            width={26}
            height={26}
            className="site-logo site-logo-light"
          />
          <Image
            src="/favicon-dark.png"
            alt="Sicheng logo dark"
            width={26}
            height={26}
            className="site-logo site-logo-dark"
          />
          Sicheng Ouyang
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <a href="https://github.com/carols12352" target="_blank" rel="noreferrer" className="ui-link ui-underline">
            GitHub
          </a>
          <span className="text-gray-400">·</span>
          <a href="https://www.linkedin.com/in/sicheng-ouyang/" target="_blank" rel="noreferrer" className="ui-link ui-underline">
            LinkedIn
          </a>
          <span className="text-gray-400">·</span>
          <a href="mailto:sicheng.ouyang@uwaterloo.ca" target="_blank" rel="noreferrer" className="ui-link ui-underline">
            Contact
          </a>
          <span className="text-gray-400">·</span>
          <a
            href="https://www.buymeacoffee.com/ouyang12352"
            target="_blank"
            rel="noreferrer"
            className="ui-link ui-underline"
          >
            Buy Me a Coffee
          </a>
          <span className="text-gray-400">·</span>
          <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="ui-link ui-underline">
            Sitemap
          </a>
        </div>

        <FooterTerminalHint />
        <p className="mt-5 text-xs text-gray-400">© 2026 All rights reserved.</p>
      </footer>

      {showShortcutHelp ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
          onClick={() => setShowShortcutHelp(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-gray-300 bg-white p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-sm font-semibold text-gray-900">Keyboard Shortcuts</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><span className="font-mono">j</span> scroll down</li>
              <li><span className="font-mono">k</span> scroll up</li>
              <li><span className="font-mono">/</span> focus search (if available)</li>
              <li><span className="font-mono">?</span> toggle this panel</li>
              <li><span className="font-mono">Esc</span> close panel</li>
            </ul>
          </div>
        </div>
      ) : null}

      {showSearch && canOpenSearch ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 px-4 pt-20"
          onClick={() => setShowSearch(false)}
        >
          <form
            className="w-full max-w-md rounded-md border border-gray-200 bg-white px-2.5 py-2 shadow-sm"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              const query = searchQuery.trim();
              if (isWritingListPage || isProjectsPage) {
                const nextPath = isProjectsPage ? "/projects" : "/writing";
                router.push(query ? `${nextPath}?q=${encodeURIComponent(query)}` : nextPath);
                setShowSearch(false);
                return;
              }
              if (!query) {
                setShowSearch(false);
              }
            }}
          >
            <label htmlFor="site-search" className="sr-only">Search writing</label>
            <input
              ref={searchInputRef}
              id="site-search"
              name="q"
              type="search"
              data-site-search
              value={searchQuery}
              onChange={(event) => dispatchArticleSearch(event.target.value)}
              placeholder={
                isWritingArticlePage ? "Search in this article..." : "Search this page..."
              }
              className="h-7 w-full bg-transparent px-0.5 text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
            {isWritingArticlePage && searchQuery.trim().length > 0 && searchResultCount !== null ? (
              <p className="mt-1 px-0.5 text-xs text-gray-500">
                {searchResultCount > 0 ? `${searchResultCount} matches` : "No matches in this article"}
              </p>
            ) : null}
          </form>
        </div>
      ) : null}
    </div>
  );
}
