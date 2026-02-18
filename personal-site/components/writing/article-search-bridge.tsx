"use client";

import { useEffect } from "react";

const HIGHLIGHT_CLASS = "article-search-hit";
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "MARK", "CODE", "PRE"]);

function clearHighlights(root: HTMLElement) {
  const marks = root.querySelectorAll<HTMLElement>(`mark.${HIGHLIGHT_CLASS}`);
  for (const mark of marks) {
    const parent = mark.parentNode;
    if (!parent) {
      continue;
    }
    parent.replaceChild(document.createTextNode(mark.textContent ?? ""), mark);
    parent.normalize();
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatches(root: HTMLElement, rawQuery: string): number {
  clearHighlights(root);

  const query = rawQuery.trim();
  if (!query) {
    return 0;
  }

  const regex = new RegExp(escapeRegExp(query), "gi");
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node: Node | null = walker.nextNode();
  while (node) {
    const parent = node.parentElement;
    const content = node.textContent ?? "";
    if (parent && !SKIP_TAGS.has(parent.tagName) && content.trim()) {
      textNodes.push(node as Text);
    }
    node = walker.nextNode();
  }

  let count = 0;

  for (const textNode of textNodes) {
    const text = textNode.textContent ?? "";
    regex.lastIndex = 0;
    const matches = Array.from(text.matchAll(regex));
    if (matches.length === 0) {
      continue;
    }

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    for (const match of matches) {
      const start = match.index ?? 0;
      const value = match[0] ?? "";
      if (!value) {
        continue;
      }
      if (start > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, start)));
      }
      const mark = document.createElement("mark");
      mark.className = HIGHLIGHT_CLASS;
      mark.textContent = value;
      fragment.appendChild(mark);
      lastIndex = start + value.length;
      count += 1;
    }

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    textNode.parentNode?.replaceChild(fragment, textNode);
  }

  if (count > 0) {
    const first = root.querySelector<HTMLElement>(`mark.${HIGHLIGHT_CLASS}`);
    first?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  return count;
}

export function ArticleSearchBridge() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".mdx-prose");
    if (!root) {
      return;
    }

    const onSearch = (event: Event) => {
      const detail = (event as CustomEvent<{ query: string }>).detail;
      const query = detail?.query ?? "";
      const count = highlightMatches(root, query);
      window.dispatchEvent(
        new CustomEvent("site:article-search-result", {
          detail: { query, count },
        }),
      );
    };

    window.addEventListener("site:article-search", onSearch as EventListener);
    return () => window.removeEventListener("site:article-search", onSearch as EventListener);
  }, []);

  return null;
}
