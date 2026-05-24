"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppReducedMotion } from "@/hooks/use-app-reduced-motion";

export type ExperienceEntry = {
  anchor: string;
  period: string;
  role: string;
  organization: string;
  location?: string;
  summary: string;
  stack: Array<{ name: string; href: string }>;
  highlights: string[];
  focus: string;
  outcomes: string[];
  link?: string;
};

type ExperiencesTreeTimelineProps = {
  experiences: ExperienceEntry[];
  searchQuery?: string;
};

export function ExperiencesTreeTimeline({ experiences, searchQuery = "" }: ExperiencesTreeTimelineProps) {
  const [activeExperience, setActiveExperience] = useState<ExperienceEntry | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const reduceMotion = useAppReducedMotion();
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const orderedExperiences = useMemo(
    () => [...experiences].sort((a, b) => (a.period < b.period ? 1 : -1)),
    [experiences],
  );

  const setHash = useCallback((anchor: string) => {
    if (typeof window === "undefined") {
      return;
    }
    const next = `#${anchor}`;
    if (window.location.hash !== next) {
      window.history.replaceState(null, "", `${window.location.pathname}${next}`);
    }
  }, []);

  const clearHash = useCallback(() => {
    if (typeof window === "undefined" || !window.location.hash) {
      return;
    }
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  const closeExperience = useCallback(() => {
    setIsFullscreen(false);
    setActiveExperience(null);
    clearHash();
  }, [clearHash]);

  useEffect(() => {
    if (!activeExperience) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialogNode = dialogRef.current;
    document.body.style.overflow = "hidden";

    window.requestAnimationFrame(() => {
      const target = dialogNode?.querySelector<HTMLElement>("button, a[href], [tabindex]:not([tabindex='-1'])");
      (target ?? dialogNode)?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeExperience();
        return;
      }
      if (event.key !== "Tab" || !dialogNode) {
        return;
      }

      const focusable = Array.from(
        dialogNode.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
        ),
      );
      if (focusable.length === 0) {
        event.preventDefault();
        dialogNode.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocused?.focus();
    };
  }, [activeExperience, closeExperience]);

  const cardTransition = {
    type: "tween",
    duration: reduceMotion ? 0 : 0.36,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  const highlightText = (text: string) => {
    if (!normalizedQuery) {
      return text;
    }
    const escaped = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "ig"));
    return parts.map((part, index) =>
      part.toLowerCase() === normalizedQuery ? (
        <mark key={`${part}-${index}`} className="article-search-hit">
          {part}
        </mark>
      ) : (
        <span key={`${part}-${index}`}>{part}</span>
      ),
    );
  };

  return (
    <LayoutGroup id="experiences-window">
      <div className="relative mt-12">
        <div className="project-timeline-rail pointer-events-none absolute top-2 bottom-2 left-[1.05rem] w-px" />
        <div className="space-y-8">
          {orderedExperiences.map((experience) => {
            const isActive = activeExperience?.anchor === experience.anchor;
            return (
              <article key={experience.anchor} id={experience.anchor} className="relative pl-12">
                <span className="project-timeline-node absolute left-2 top-3 h-[0.95rem] w-[0.95rem] rounded-full border border-gray-300 bg-white" />
                <motion.div
                  layoutId={reduceMotion ? undefined : `experience-card-${experience.anchor}`}
                  transition={cardTransition}
                  className={`project-card-surface w-full rounded-xl border bg-white/95 p-5 text-left transition-colors ${
                    isActive ? "border-gray-300 project-card-active-shadow" : "border-gray-200 shadow-sm hover:border-gray-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsFullscreen(false);
                      setActiveExperience(experience);
                      setHash(experience.anchor);
                    }}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase">
                          {experience.period}
                        </p>
                        <h2 className="mt-3 text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                          {highlightText(experience.role)}
                        </h2>
                        <p className="mt-1 text-sm font-medium text-gray-500">
                          {highlightText(experience.organization)}
                          {experience.location ? <span> · {experience.location}</span> : null}
                        </p>
                        <p className="mt-3 text-sm text-gray-600">{highlightText(experience.summary)}</p>
                      </div>
                      <span className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        open
                        <span>▸</span>
                      </span>
                    </div>
                  </button>
                  {experience.link ? (
                    <div className="absolute top-14 right-5">
                      <a
                        href={experience.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-gray-800 hover:decoration-gray-500"
                      >
                        link
                        <span>↗</span>
                      </a>
                    </div>
                  ) : null}
                </motion.div>
              </article>
            );
          })}
        </div>
      </div>

      <AnimatePresence initial={!reduceMotion}>
        {activeExperience ? (
          <>
            <motion.button
              type="button"
              className="project-modal-backdrop fixed inset-0 z-40 backdrop-blur-[1px]"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
              onClick={closeExperience}
            />

            <div
              className="fixed inset-0 z-50 overflow-y-auto px-4 py-8 sm:px-10 sm:py-14"
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  closeExperience();
                }
              }}
            >
              <motion.section
                ref={dialogRef}
                layoutId={reduceMotion ? undefined : `experience-card-${activeExperience.anchor}`}
                transition={cardTransition}
                className={`project-card-surface project-modal-surface mx-auto w-full rounded-2xl border border-gray-300 bg-white text-left ${
                  isFullscreen
                    ? "max-w-none min-h-[calc(100dvh-4rem)] p-6 sm:min-h-[calc(100dvh-6rem)] sm:p-8"
                    : "max-w-5xl p-7 sm:p-12"
                }`}
              >
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={closeExperience}
                      className="flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f57] text-[9px] text-black/60"
                    >
                      <span>×</span>
                    </button>
                    <button
                      type="button"
                      onClick={closeExperience}
                      className="flex h-3 w-3 items-center justify-center rounded-full bg-[#febc2e] text-[9px] text-black/60"
                    >
                      <span>−</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFullscreen((prev) => !prev)}
                      className="flex h-3 w-3 items-center justify-center rounded-full bg-[#28c840] text-[8px] text-black/60"
                    >
                      <span>{isFullscreen ? "↙" : "↗"}</span>
                    </button>
                  </div>
                  {activeExperience.link ? (
                    <a
                      href={activeExperience.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-gray-800 hover:decoration-gray-500"
                    >
                      <span>↗</span>
                      Organization
                    </a>
                  ) : null}
                </div>

                <p className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase">
                  {activeExperience.period}
                </p>
                <h2 className="mt-6 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                  {activeExperience.role}
                </h2>
                <p className="mt-2 text-sm font-medium text-gray-500">
                  {activeExperience.organization}
                  {activeExperience.location ? <span> · {activeExperience.location}</span> : null}
                </p>
                <p className="mt-6 max-w-3xl text-sm leading-7 text-gray-600 sm:text-base">
                  {activeExperience.summary}
                </p>

                <div className="mt-12 border-t border-gray-200 pt-0">
                  <section>
                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Stack
                    </p>
                    <ul className="mt-4 m-0 flex flex-wrap items-center gap-y-2 text-sm text-gray-600">
                      {activeExperience.stack.map((item, index) => (
                        <li key={item.name} className="inline-flex items-center m-0">
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center transition-colors hover:text-gray-900"
                          >
                            {item.name}
                          </a>
                          {index < activeExperience.stack.length - 1 ? (
                            <span className="mx-2 text-gray-400">|</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="mt-10">
                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Delivered
                    </p>
                    <ul className="mt-5 m-0 list-disc pl-5 leading-7 [&>li]:m-0 [&>li+li]:mt-3">
                      {activeExperience.highlights.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>

                  <section className="mt-10">
                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Focus
                    </p>
                    <div className="mt-5 leading-7">
                      <p>{activeExperience.focus}</p>
                    </div>
                  </section>

                  <section className="mt-10">
                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Outcomes
                    </p>
                    <ul className="mt-5 m-0 list-disc pl-5 leading-7 [&>li]:m-0 [&>li+li]:mt-3">
                      {activeExperience.outcomes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>
                </div>
              </motion.section>
            </div>
          </>
        ) : null}
      </AnimatePresence>
    </LayoutGroup>
  );
}
