"use client";

import { useEffect, useId, useState } from "react";

type MermaidRuntime = {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, definition: string) => Promise<{ svg: string }>;
};

declare global {
  interface Window {
    mermaid?: MermaidRuntime;
  }
}

let mermaidLoader: Promise<MermaidRuntime> | null = null;

function loadMermaid(): Promise<MermaidRuntime> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Mermaid can only run in the browser."));
  }

  if (window.mermaid) {
    return Promise.resolve(window.mermaid);
  }

  if (!mermaidLoader) {
    mermaidLoader = new Promise<MermaidRuntime>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-mermaid-loader="true"]');

      const attachReadyHandler = (script: HTMLScriptElement) => {
        script.addEventListener("load", () => {
          if (window.mermaid) {
            resolve(window.mermaid);
            return;
          }
          reject(new Error("Mermaid script loaded but runtime was not found."));
        });
        script.addEventListener("error", () => {
          reject(new Error("Failed to load Mermaid runtime."));
        });
      };

      if (existing) {
        attachReadyHandler(existing);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
      script.async = true;
      script.dataset.mermaidLoader = "true";
      attachReadyHandler(script);
      document.head.appendChild(script);
    });
  }

  return mermaidLoader;
}

type MermaidDiagramProps = {
  chart: string;
  title: string;
};

export function MermaidDiagram({ chart, title }: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string>("");
  const [hasError, setHasError] = useState(false);
  const reactId = useId();
  const diagramId = `mermaid-${reactId.replace(/:/g, "")}`;

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      try {
        const mermaid = await loadMermaid();
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "neutral",
        });

        const rendered = await mermaid.render(diagramId, chart);
        if (!cancelled) {
          setSvg(rendered.svg);
          setHasError(false);
        }
      } catch {
        if (!cancelled) {
          setHasError(true);
        }
      }
    }

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [chart, diagramId]);

  return (
    <figure className="terminal-demo mt-4">
      <figcaption className="terminal-demo-head">{title}</figcaption>
      <div className="mermaid-diagram">
        {svg ? (
          <div
            className="mermaid-diagram-svg"
            role="img"
            aria-label={title}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <pre className="terminal-demo-body" aria-label={title}>
            <code>{chart}</code>
          </pre>
        )}
      </div>
      {hasError ? (
        <p className="mermaid-diagram-note">Mermaid failed to render. Showing source instead.</p>
      ) : null}
    </figure>
  );
}
