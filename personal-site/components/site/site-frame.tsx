"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PageTransition } from "@/components/motion/page-transition";
import { MotionToggle } from "@/components/navigation/motion-toggle";
import { NavLink } from "@/components/navigation/nav-link";
import { ThemeToggle } from "@/components/navigation/theme-toggle";

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
  const shortcutNudgeKey = "site-shortcut-nudge-dismissed";
  const router = useRouter();
  const pathname = usePathname();
  const isTerminalPage = pathname === "/terminal";
  const isWritingListPage = pathname === "/writing";
  const isProjectsPage = pathname === "/projects";
  const isWritingArticlePage = /^\/writing\/[^/]+$/.test(pathname);
  const canOpenSearch = isWritingArticlePage || isWritingListPage || isProjectsPage;
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showShortcutNudge, setShowShortcutNudge] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResultCount, setSearchResultCount] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const shortcutsDialogRef = useRef<HTMLDivElement>(null);
  const searchDialogRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const dismissed = window.localStorage.getItem(shortcutNudgeKey) === "true";
        setShowShortcutNudge(!dismissed);
      } catch {
        setShowShortcutNudge(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

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

      const isQuestionShortcut =
        event.key === "?" ||
        event.key === "？" ||
        (event.code === "Slash" && event.shiftKey);

      if (isQuestionShortcut) {
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

  useEffect(() => {
    const dialog = showShortcutHelp ? shortcutsDialogRef.current : showSearch ? searchDialogRef.current : null;
    if (!dialog) {
      return;
    }

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const selectors = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
    ].join(",");
    const getFocusable = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(selectors)).filter((node) => !node.hasAttribute("aria-hidden"));

    const focusable = getFocusable();
    const first = focusable[0];
    if (first) {
      first.focus();
    } else {
      dialog.focus();
    }

    const onKeyDown = (event: Event) => {
      const keyEvent = event as KeyboardEvent;
      if (keyEvent.key !== "Tab") {
        return;
      }
      const currentFocusable = getFocusable();
      if (currentFocusable.length === 0) {
        keyEvent.preventDefault();
        dialog.focus();
        return;
      }
      const firstNode = currentFocusable[0];
      const lastNode = currentFocusable[currentFocusable.length - 1];
      if (keyEvent.shiftKey && document.activeElement === firstNode) {
        keyEvent.preventDefault();
        lastNode.focus();
      } else if (!keyEvent.shiftKey && document.activeElement === lastNode) {
        keyEvent.preventDefault();
        firstNode.focus();
      }
    };

    dialog.addEventListener("keydown", onKeyDown);
    return () => {
      dialog.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [showShortcutHelp, showSearch]);

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

  const dismissShortcutNudge = () => {
    try {
      window.localStorage.setItem(shortcutNudgeKey, "true");
    } catch {
      // Ignore storage failures.
    }
    setShowShortcutNudge(false);
  };

  if (isTerminalPage) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10 sm:py-12">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header>
        <div className="flex items-center justify-between gap-3">
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
          <div className="hidden items-center gap-2 md:flex">
            <MotionToggle />
            <ThemeToggle />
          </div>
          <button
            type="button"
            className="mobile-nav-btn md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-site-nav"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>
        <nav className="mt-4 hidden flex-wrap gap-x-6 gap-y-2 text-sm md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
        {mobileMenuOpen ? (
          <div id="mobile-site-nav" className="mobile-nav-sheet md:hidden">
            <nav className="flex flex-col gap-3 text-sm" aria-label="Mobile navigation" onClick={() => setMobileMenuOpen(false)}>
              {navItems.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} />
              ))}
            </nav>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <MotionToggle />
              <ThemeToggle />
            </div>
          </div>
        ) : null}
      </header>

      <main id="main-content" className="mt-12 flex-1">
        <PageTransition>{children}</PageTransition>
      </main>

      <footer className="footer-shell mt-24 border-t border-gray-200 pt-7 pb-4 text-sm text-gray-500">
        <div className="footer-top">
          <div className="footer-brand">
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
            <p className="mt-1.5 text-xs text-gray-500">Software Engineering student. Backend systems, practical ML, product delivery.</p>
          </div>

          <div className="footer-links" role="list" aria-label="Footer links">
            <a href="https://github.com/carols12352" target="_blank" rel="noreferrer" className="ui-link ui-underline">GitHub</a>
            <a href="https://www.linkedin.com/in/sicheng-ouyang/" target="_blank" rel="noreferrer" className="ui-link ui-underline">LinkedIn</a>
            <a href="mailto:sicheng.ouyang@uwaterloo.ca" target="_blank" rel="noreferrer" className="ui-link ui-underline">Contact</a>
            <a href="https://www.buymeacoffee.com/ouyang12352" target="_blank" rel="noreferrer" className="ui-link ui-underline">Buy Me a Coffee</a>
            <a href="/rss.xml" target="_blank" rel="noreferrer" className="ui-link ui-underline">rss.xml</a>
            <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="ui-link ui-underline">sitemap.xml</a>
          </div>
        </div>

        <div className="footer-meta mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs">
          <Link href="/privacy" className="ui-link ui-underline">Privacy Policy</Link>
          <span className="text-gray-400">·</span>
          <Link href="/terms" className="ui-link ui-underline">Terms of Service</Link>
          <span className="text-gray-400">·</span>
          <Link href="/disclaimer" className="ui-link ui-underline">Disclaimer</Link>
          <span className="text-gray-400">·</span>
          <button
            type="button"
            className="footer-shortcut-link ui-link ui-underline"
            onClick={() => setShowShortcutHelp(true)}
            aria-label="Open keyboard shortcuts"
          >
            Keyboard shortcuts (?)
          </button>
          <span className="text-gray-400">·</span>
          <span>© 2026 Sicheng Ouyang</span>
        </div>
        {showShortcutNudge ? (
          <div className="shortcut-nudge mt-2 text-[11px] text-gray-500" role="status">
            <span>
              Tip: press <kbd>?</kbd> to view shortcuts, and use <kbd>j</kbd>/<kbd>k</kbd> to scroll.
            </span>
            <button
              type="button"
              className="ui-link ui-underline"
              onClick={dismissShortcutNudge}
              aria-label="Dismiss shortcut tip"
            >
              Dismiss
            </button>
          </div>
        ) : null}
      </footer>

      {showShortcutHelp ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-title"
          onClick={() => setShowShortcutHelp(false)}
        >
          <div
            ref={shortcutsDialogRef}
            className="w-full max-w-sm rounded-xl border border-gray-300 bg-white p-5"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            <p id="shortcuts-title" className="text-sm font-semibold text-gray-900">Keyboard Shortcuts</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><span className="font-mono">j</span> scroll down</li>
              <li><span className="font-mono">k</span> scroll up</li>
              <li><span className="font-mono">/</span> search in Writing/Projects/Article</li>
              <li><span className="font-mono">?</span> toggle this panel</li>
              <li><span className="font-mono">Esc</span> close panel</li>
            </ul>
          </div>
        </div>
      ) : null}

      {showSearch && canOpenSearch ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 px-4 pt-20"
          role="dialog"
          aria-modal="true"
          aria-labelledby="site-search-label"
          onClick={() => setShowSearch(false)}
        >
          <form
            ref={searchDialogRef}
            className="w-full max-w-md rounded-md border border-gray-200 bg-white px-2.5 py-2 shadow-sm"
            tabIndex={-1}
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
            <label id="site-search-label" htmlFor="site-search" className="sr-only">Search this site</label>
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
