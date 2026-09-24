"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DETAIL_WINDOW_DURATION, DETAIL_WINDOW_TRANSITION } from "@/components/detail/detail-window-motion";
import { DetailWindow } from "@/components/detail/detail-window";
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
  const reduceMotion = useAppReducedMotion();
  const [windowMinimized, setWindowMinimized] = useState(false);
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
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${next}`);
    }
  }, []);

  const clearHash = useCallback(() => {
    if (typeof window === "undefined" || !window.location.hash) {
      return;
    }
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }, []);

  const closeExperience = useCallback(() => {
    setActiveExperience(null);
    clearHash();
  }, [clearHash]);

  useEffect(() => {
    const syncHash = () => {
      setWindowMinimized(false);
      const anchor = window.location.hash.slice(1);
      setActiveExperience(experiences.find((item) => item.anchor === anchor) ?? null);
    };
    const frame = window.requestAnimationFrame(syncHash);
    window.addEventListener("hashchange", syncHash);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", syncHash);
    };
  }, [experiences]);

  const cardTransition = {
    ...DETAIL_WINDOW_TRANSITION,
    duration: reduceMotion ? 0 : DETAIL_WINDOW_DURATION,
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
      <div className="relative page-section-gap">
        <div className="project-timeline-rail pointer-events-none absolute top-2 bottom-2 left-[1.05rem] w-px" />
        <div className="space-y-10">
          {orderedExperiences.map((experience) => {
            const isActive = activeExperience?.anchor === experience.anchor;
            return (
              <article key={experience.anchor} id={experience.anchor} className="relative pl-12">
                <span className="project-timeline-node absolute left-2 top-3 h-[0.95rem] w-[0.95rem] rounded-full border border-gray-300 bg-white" />
                <motion.div
                  layoutId={reduceMotion ? undefined : `experience-card-${experience.anchor}`}
                  transition={cardTransition}
                  className={`project-card-surface w-full rounded-xl border bg-white/95 p-6 text-left transition-colors ${
                    isActive ? "border-gray-300 project-card-active-shadow" : "border-gray-200 shadow-sm hover:border-gray-300"
                  }`}
                >
                  <motion.div
                    initial={false}
                    animate={{ opacity: isActive && !windowMinimized ? 0 : 1 }}
                    transition={{ duration: 0, delay: reduceMotion || (isActive && !windowMinimized) ? 0 : DETAIL_WINDOW_DURATION }}
                    data-detail-card-content
                  >
                  <button
                    type="button"
                    onClick={() => {
                      setWindowMinimized(false);
                      setActiveExperience(experience);
                      setHash(experience.anchor);
                    }}
                    className="w-full text-left"
                    aria-haspopup="dialog"
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
                        <p className="mt-4 text-sm leading-6 text-gray-600">{highlightText(experience.summary)}</p>
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
                </motion.div>
              </article>
            );
          })}
        </div>
      </div>

      <AnimatePresence initial={!reduceMotion}>
        {activeExperience ? (
          <DetailWindow
            key={activeExperience.anchor}
            layoutId={`experience-card-${activeExperience.anchor}`}
            title={activeExperience.organization}
            titleId={`experience-dialog-title-${activeExperience.anchor}`}
            onClose={closeExperience}
            onMinimizedChange={setWindowMinimized}
          >
                {activeExperience.link ? <a href={activeExperience.link} target="_blank" rel="noreferrer" className="ui-link ui-underline text-xs">Organization ↗</a> : null}
                <p className="text-xs font-medium tracking-wide text-gray-500">
                  {activeExperience.period}
                </p>
                <h2 id={`experience-dialog-title-${activeExperience.anchor}`} className="mt-6 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                  {activeExperience.role}
                </h2>
                <p className="mt-2 text-sm font-medium text-gray-500">
                  {activeExperience.organization}
                  {activeExperience.location ? <span> · {activeExperience.location}</span> : null}
                </p>
                <p className="mt-6 max-w-3xl text-sm leading-7 text-gray-600 sm:text-base">
                  {activeExperience.summary}
                </p>

                {activeExperience.stack.length || activeExperience.highlights.length || activeExperience.focus || activeExperience.outcomes.length ? (
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
                ) : null}
          </DetailWindow>
        ) : null}
      </AnimatePresence>
    </LayoutGroup>
  );
}
