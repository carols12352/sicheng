"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactElement, ReactNode } from "react";
import { isValidElement } from "react";
import { useEffect, useId, useState } from "react";
import { useAppReducedMotion } from "@/hooks/use-app-reduced-motion";

type MermaidRuntime = {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, definition: string) => Promise<{ svg: string }>;
};

let mermaidLoader: Promise<MermaidRuntime> | null = null;
let initialized = false;

async function loadMermaid(): Promise<MermaidRuntime> {
  if (!mermaidLoader) {
    mermaidLoader = import("mermaid").then((module) => {
      const runtime = (module.default ?? module) as unknown as MermaidRuntime;
      if (!initialized) {
        runtime.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "neutral",
        });
        initialized = true;
      }
      return runtime;
    });
  }

  return mermaidLoader;
}

type MermaidDiagramProps = {
  chart?: string;
  title?: string;
  children?: ReactNode;
};

function textFromChildren(children: ReactNode): string {
  if (typeof children === "string") {
    return children;
  }
  if (typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children
      .map((child) => textFromChildren(child))
      .join("");
  }
  if (isValidElement(children)) {
    return textFromChildren((children as ReactElement<{ children?: ReactNode }>).props.children);
  }
  return "";
}

export function MermaidDiagram({ chart, title = "Diagram", children }: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string>("");
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [zoomOpen, setZoomOpen] = useState(false);
  const reduceMotion = useAppReducedMotion();
  const reactId = useId();
  const diagramId = `mermaid-${reactId.replace(/:/g, "")}`;
  const layoutId = `mermaid-layout-${reactId.replace(/:/g, "")}`;
  const chartSource = typeof chart === "string" && chart.length > 0 ? chart : textFromChildren(children);

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      if (!chartSource.trim()) {
        if (!cancelled) {
          setSvg("");
          setHasError(true);
          setErrorMessage("No Mermaid chart content was provided.");
        }
        return;
      }

      try {
        const mermaid = await loadMermaid();

        const normalizedChart = chartSource.trim();
        const runId = `${diagramId}-${Date.now().toString(36)}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;
        let rendered: { svg: string };
        try {
          rendered = await mermaid.render(runId, normalizedChart);
        } catch (error) {
          if (/^\s*graph\s+/i.test(normalizedChart)) {
            const flowchartFallback = normalizedChart.replace(/^\s*graph\s+/i, "flowchart ");
            rendered = await mermaid.render(`${runId}-fallback`, flowchartFallback);
          } else {
            throw error;
          }
        }
        if (!cancelled) {
          setSvg(rendered.svg);
          setHasError(false);
          setErrorMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setHasError(true);
          setErrorMessage(error instanceof Error ? error.message : "Unknown Mermaid runtime error.");
        }
      }
    }

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [chartSource, diagramId]);

  useEffect(() => {
    if (!zoomOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setZoomOpen(false);
      }
    };
    const onScroll = () => setZoomOpen(false);

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [zoomOpen]);

  return (
    <>
      <figure className="terminal-demo">
        <figcaption className="terminal-demo-head">{title}</figcaption>
        <div className="mermaid-diagram">
          {svg ? (
            <button
              type="button"
              className="mermaid-diagram-trigger"
              onClick={() => setZoomOpen(true)}
              aria-label={`Zoom diagram: ${title}`}
            >
              <motion.div
                layoutId={reduceMotion ? undefined : layoutId}
                className="mermaid-diagram-svg"
                role="img"
                aria-label={title}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </button>
          ) : (
            <pre className="terminal-demo-body" aria-label={title}>
              <code>{chartSource}</code>
            </pre>
          )}
        </div>
        {hasError ? (
          <p className="mermaid-diagram-note">
            Mermaid failed to render. Showing source instead.
            {errorMessage ? ` (${errorMessage})` : ""}
          </p>
        ) : null}
      </figure>

      <AnimatePresence>
        {zoomOpen && svg ? (
          <motion.div
            className="mermaid-zoom-overlay"
            onClick={() => setZoomOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            <motion.div
              layoutId={reduceMotion ? undefined : layoutId}
              className="mermaid-zoom-panel"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`Zoomed diagram: ${title}`}
              transition={{ duration: reduceMotion ? 0 : 0.24 }}
            >
              <div className="mermaid-zoom-header">
                <p className="mermaid-zoom-title">{title}</p>
                <button type="button" className="mermaid-zoom-close" onClick={() => setZoomOpen(false)}>
                  <span className="sr-only">Close zoomed diagram</span>
                  Close
                </button>
              </div>
              <div
                className="mermaid-zoom-svg"
                role="img"
                aria-label={title}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
