"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { MermaidDiagram } from "@/components/projects/mermaid-diagram";
import { TerminalDemo } from "@/components/projects/terminal-demo";

export type ProjectEntry = {
  anchor: string;
  period: string;
  name: string;
  repo: string;
  summary: string;
  stack: Array<{ name: string; href: string }>;
  highlights: string[];
  challenges: string;
  nextSteps: string[];
  mermaidTitle?: string;
  mermaidChart?: string;
  terminalTitle?: string;
  terminalLines?: string[];
};

type ProjectsTreeTimelineProps = {
  projects: ProjectEntry[];
};

export function ProjectsTreeTimeline({ projects }: ProjectsTreeTimelineProps) {
  const [activeProject, setActiveProject] = useState<ProjectEntry | null>(null);

  const orderedProjects = useMemo(
    () =>
      [...projects].sort((a, b) =>
        a.period < b.period ? 1 : -1,
      ),
    [projects],
  );

  useEffect(() => {
    if (!activeProject) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveProject(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeProject]);

  const cardTransition = { type: "tween", duration: 0.36, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <LayoutGroup id="projects-window">
      <div className="relative mt-12">
        <div className="project-timeline-rail pointer-events-none absolute top-2 bottom-2 left-[1.05rem] w-px" />
        <div className="space-y-8">
          {orderedProjects.map((project) => {
            const isActive = activeProject?.anchor === project.anchor;
            return (
              <article key={project.anchor} id={project.anchor} className="relative pl-12">
                <span className="project-timeline-node absolute left-2 top-3 h-[0.95rem] w-[0.95rem] rounded-full border border-gray-300 bg-white" />
                <motion.button
                  type="button"
                  layoutId={`project-card-${project.anchor}`}
                  transition={cardTransition}
                  onClick={() => setActiveProject(project)}
                  className={`project-card-surface w-full rounded-xl border bg-white/95 p-5 text-left transition-colors ${
                    isActive ? "border-gray-300 project-card-active-shadow" : "border-gray-200 shadow-sm hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase">
                        {project.period}
                      </p>
                      <h2 className="mt-3 text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">{project.name}</h2>
                      <p className="mt-3 text-sm text-gray-600">{project.summary}</p>
                    </div>
                    <span className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      open
                      <span>▸</span>
                    </span>
                  </div>
                </motion.button>
              </article>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {activeProject ? (
          <>
            <motion.button
              type="button"
              aria-label="Close project window"
              className="project-modal-backdrop fixed inset-0 z-40 backdrop-blur-[1px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => setActiveProject(null)}
            />

            <div
              className="fixed inset-0 z-50 overflow-y-auto px-4 py-8 sm:px-10 sm:py-14"
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  setActiveProject(null);
                }
              }}
            >
              <motion.section
                layoutId={`project-card-${activeProject.anchor}`}
                transition={cardTransition}
                role="dialog"
                aria-modal="true"
                aria-label={activeProject.name}
                className="project-card-surface project-modal-surface mx-auto w-full max-w-5xl rounded-2xl border border-gray-300 bg-white p-7 text-left sm:p-12"
              >
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveProject(null)}
                    className="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-600 transition-colors hover:border-gray-300"
                  >
                    close
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase">
                    {activeProject.period}
                  </p>
                  <a
                    href={activeProject.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
                  >
                    GitHub Repo
                  </a>
                </div>
                <h2 className="mt-6 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">{activeProject.name}</h2>
                <p className="mt-6 max-w-3xl text-sm leading-7 text-gray-600 sm:text-base">{activeProject.summary}</p>

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
                            <span aria-hidden className="mx-2 text-gray-400">|</span>
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

                  <section className="mt-10">
                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Next Iteration
                    </p>
                    <ul className="mt-5 m-0 list-disc pl-5 leading-7 [&>li]:m-0 [&>li+li]:mt-3">
                      {activeProject.nextSteps.map((item) => (
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
