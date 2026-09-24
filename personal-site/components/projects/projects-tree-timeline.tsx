"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DETAIL_WINDOW_DURATION, DETAIL_WINDOW_TRANSITION } from "@/components/detail/detail-window-motion";
import { DetailWindow } from "@/components/detail/detail-window";
import { useAppReducedMotion } from "@/hooks/use-app-reduced-motion";
import { MermaidDiagram } from "@/components/projects/mermaid-diagram";
import { TerminalDemo } from "@/components/projects/terminal-demo";

export type ProjectEntry = {
  anchor: string;
  period: string;
  name: string;
  repo?: string;
  demo?: string;
  summary: string;
  stack: Array<{ name: string; href: string }>;
  highlights: string[];
  challenges: string;
  mermaidTitle?: string;
  mermaidChart?: string;
  terminalTitle?: string;
  terminalLines?: string[];
};

type ProjectsTreeTimelineProps = {
  projects: ProjectEntry[];
  searchQuery?: string;
};

export function ProjectsTreeTimeline({ projects, searchQuery = "" }: ProjectsTreeTimelineProps) {
  const [activeProject, setActiveProject] = useState<ProjectEntry | null>(null);
  const reduceMotion = useAppReducedMotion();
  const [windowMinimized, setWindowMinimized] = useState(false);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const orderedProjects = useMemo(
    () =>
      [...projects].sort((a, b) =>
        a.period < b.period ? 1 : -1,
      ),
    [projects],
  );

  const setHash = useCallback((anchor: string) => {
    if (typeof window === "undefined") {
      return;
    }
    const next = `#${anchor}`;
    if (window.location.hash === next) {
      return;
    }
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${next}`);
  }, []);

  const clearHash = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!window.location.hash) {
      return;
    }
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }, []);

  const closeProject = useCallback(() => {
    setActiveProject(null);
    clearHash();
  }, [clearHash]);

  useEffect(() => {
    const syncHash = () => {
      setWindowMinimized(false);
      const anchor = window.location.hash.slice(1);
      setActiveProject(projects.find((item) => item.anchor === anchor) ?? null);
    };
    const frame = window.requestAnimationFrame(syncHash);
    window.addEventListener("hashchange", syncHash);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", syncHash);
    };
  }, [projects]);

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
    <LayoutGroup id="projects-window">
      <div className="relative page-section-gap">
        <div className="project-timeline-rail pointer-events-none absolute top-2 bottom-2 left-[1.05rem] w-px" />
        <div className="space-y-10">
          {orderedProjects.map((project) => {
            const isActive = activeProject?.anchor === project.anchor;
            return (
              <article key={project.anchor} id={project.anchor} className="relative pl-12">
                <span className="project-timeline-node absolute left-2 top-3 h-[0.95rem] w-[0.95rem] rounded-full border border-gray-300 bg-white" />
                <motion.div
                  layoutId={reduceMotion ? undefined : `project-card-${project.anchor}`}
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
                      setActiveProject(project);
                      setHash(project.anchor);
                    }}
                    className="w-full text-left"
                    aria-haspopup="dialog"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase">
                          {project.period}
                        </p>
                        <h2 className="mt-3 text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">{highlightText(project.name)}</h2>
                        <p className="mt-4 text-sm leading-6 text-gray-600">{highlightText(project.summary)}</p>
                      </div>
                      <span className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        open
                        <span>▸</span>
                      </span>
                    </div>
                  </button>
                  <div className="absolute top-14 right-5 flex items-center gap-3">
                    {project.demo ? (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-gray-800 hover:decoration-gray-500"
                      >
                        demo
                        <span>↗</span>
                      </a>
                    ) : null}
                    {project.repo ? (
                      <a
                      href={project.repo}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-gray-800 hover:decoration-gray-500"
                    >
                      repo
                      <span>↗</span>
                    </a>
                    ) : null}
                  </div>
                  </motion.div>
                </motion.div>
              </article>
            );
          })}
        </div>
      </div>

      <AnimatePresence initial={!reduceMotion}>
        {activeProject ? (
          <DetailWindow
            key={activeProject.anchor}
            layoutId={`project-card-${activeProject.anchor}`}
            title={activeProject.name}
            titleId={`project-dialog-title-${activeProject.anchor}`}
            onClose={closeProject}
            onMinimizedChange={setWindowMinimized}
          >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-medium tracking-wide text-gray-500">
                    {activeProject.period}
                  </p>
                  <div className="flex items-center gap-3">
                    {activeProject.demo ? (
                      <a
                        href={activeProject.demo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-gray-800 hover:decoration-gray-500"
                      >
                        <span>↗</span>
                        Live Demo
                      </a>
                    ) : null}
                    {activeProject.repo ? (
                      <a
                      href={activeProject.repo}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-gray-800 hover:decoration-gray-500"
                    >
                      <span>↗</span>
                      GitHub Repo
                    </a>
                    ) : null}
                  </div>
                </div>
                <h2 id={`project-dialog-title-${activeProject.anchor}`} className="mt-6 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">{activeProject.name}</h2>
                <p id={`project-dialog-summary-${activeProject.anchor}`} className="mt-6 max-w-3xl text-sm leading-7 text-gray-600 sm:text-base">{activeProject.summary}</p>

                <div className="mt-12 border-t border-gray-200 pt-0">
                  <section>
                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Stack
                    </p>
                    <ul className="mt-4 m-0 flex flex-wrap items-center gap-y-2 text-sm text-gray-600">
                      {activeProject.stack.map((item, index) => (
                        <li key={item.name} className="inline-flex items-center m-0">
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center transition-colors hover:text-gray-900"
                          >
                            {item.name}
                          </a>
                          {index < activeProject.stack.length - 1 ? (
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
                      {activeProject.highlights.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>

                  {activeProject.mermaidChart && activeProject.mermaidTitle ? (
                    <div className="mt-10">
                      <MermaidDiagram chart={activeProject.mermaidChart} title={activeProject.mermaidTitle} />
                    </div>
                  ) : null}

                  {activeProject.terminalLines && activeProject.terminalTitle ? (
                    <div className="mt-10">
                      <TerminalDemo title={activeProject.terminalTitle} lines={activeProject.terminalLines} />
                    </div>
                  ) : null}

                  <section className="mt-10">
                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Technical Challenge
                    </p>
                    <div className="mt-5 leading-7">
                      <p>{activeProject.challenges}</p>
                    </div>
                  </section>

                </div>
          </DetailWindow>
        ) : null}
      </AnimatePresence>
    </LayoutGroup>
  );
}
