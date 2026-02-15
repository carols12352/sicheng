import type { Metadata } from "next";
import { MermaidDiagram } from "@/components/projects/mermaid-diagram";
import { TerminalDemo } from "@/components/projects/terminal-demo";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected software projects by Sicheng Ouyang, including backend architecture, full-stack applications, and practical ML tooling.",
  alternates: {
    canonical: "/projects",
  },
};

type ProjectEntry = {
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

const projectEntries: ProjectEntry[] = [
  {
    anchor: "chat-websocket-demo",
    period: "2025-2026",
    name: "Chat WebSocket Demo",
    repo: "https://github.com/carols12352/chat",
    summary:
      "Real-time chat system with FastAPI + WebSocket backend, PostgreSQL persistence, and Next.js frontend.",
    stack: [
      { name: "FastAPI", href: "https://fastapi.tiangolo.com/" },
      { name: "WebSocket", href: "https://developer.mozilla.org/docs/Web/API/WebSockets_API" },
      { name: "PostgreSQL", href: "https://www.postgresql.org/" },
      { name: "Next.js", href: "https://nextjs.org/" },
      { name: "React", href: "https://react.dev/" },
      { name: "JWT", href: "https://jwt.io/" },
    ],
    highlights: [
      "Implemented JWT authentication and email verification to block unverified access.",
      "Added paginated REST message history and incremental WebSocket sync for stable reconnect behavior.",
      "Documented structured API error codes and applied rate limiting controls for safer traffic handling.",
    ],
    challenges:
      "Realtime delivery quality depends on keeping API consistency, sync semantics, and auth boundaries aligned under reconnect-heavy conditions.",
    nextSteps: [
      "Introduce conversation-level delivery acknowledgements to improve replay precision.",
      "Add load-testing scenarios for large group conversations and backpressure behavior.",
    ],
    mermaidTitle: "Architecture Flow",
    mermaidChart: `
flowchart LR
  U[Next.js Client] -->|HTTP + JWT| A[FastAPI API]
  U -->|WebSocket| W[Realtime Gateway]
  A --> E[Email Verification]
  A --> R[Rate Limiter]
  A --> P[(PostgreSQL)]
  W --> P
  A --> H[Paginated History API]
`,
  },
  {
    anchor: "todo-list-web-desktop-app",
    period: "2025-2026",
    name: "Todo List Web & Desktop App",
    repo: "https://github.com/carols12352/todo",
    summary:
      "Full-stack task manager built for both browser and desktop tray usage with natural language task input.",
    stack: [
      { name: "React", href: "https://react.dev/" },
      { name: "Flask", href: "https://flask.palletsprojects.com/" },
      { name: "MySQL", href: "https://www.mysql.com/" },
      { name: "BERT", href: "https://huggingface.co/docs/transformers/model_doc/bert" },
      { name: "Desktop Tray App", href: "https://www.electronjs.org/docs/latest/api/tray" },
    ],
    highlights: [
      "Built full CRUD task flows with a React + Flask + MySQL stack.",
      "Packaged a cross-platform desktop tray app for both macOS and Windows usage.",
      "Fine-tuned BERT-based parsing to convert natural language input into structured task JSON.",
    ],
    challenges:
      "Maintaining behavior parity between web and desktop clients requires strict API contracts and normalization of input parsing outputs.",
    nextSteps: [
      "Add optimistic updates with conflict resolution for concurrent edits.",
      "Improve parser confidence scoring and fallback prompts when intent is ambiguous.",
    ],
    mermaidTitle: "Web/Desktop System Flow",
    mermaidChart: `
flowchart TD
  UI[React Web UI] --> API[Flask API]
  TRAY[Desktop Tray App] --> API
  API --> DB[(MySQL)]
  NLP[BERT Parser] --> API
  API --> OUT[Task JSON + CRUD Results]
`,
  },
  {
    anchor: "bookkeeping-command-line-tool",
    period: "2025",
    name: "Bookkeeping Command-Line Tool",
    repo: "https://github.com/carols12352/bookkeeping",
    summary:
      "Python CLI bookkeeping tool with modular command structure and persistent expense data storage.",
    stack: [
      { name: "Python", href: "https://docs.python.org/3/" },
      { name: "argparse", href: "https://docs.python.org/3/library/argparse.html" },
      { name: "File I/O", href: "https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files" },
    ],
    highlights: [
      "Implemented command parsing with argparse and modular command handlers.",
      "Added local file persistence for expense tracking and retrieval.",
      "Kept interfaces simple and scriptable for fast personal usage loops.",
    ],
    challenges:
      "CLI usability depends on concise output formatting and predictable command behavior across additive and query operations.",
    nextSteps: [
      "Add category-level analytics and monthly summary reports.",
      "Support CSV import/export for easier migration and external analysis.",
    ],
    terminalTitle: "CLI Interaction",
    terminalLines: [
      "$ bookkeeping add --amount 24.50 --category food --note lunch",
      "saved: expense#142",
      "$ bookkeeping add --amount 89.00 --category transit --note presto",
      "saved: expense#143",
      "$ bookkeeping summary --month 2026-02",
      "food ............. 24.50",
      "transit .......... 89.00",
      "total ............ 113.50",
    ],
  },
  {
    anchor: "nurel-ai-playground",
    period: "2025",
    name: "Nurel AI Playground",
    repo: "https://github.com/carols12352/Neural-Network-Playground",
    summary:
      "A team-built local AI experimentation web app for model training controls and real-time training visualization.",
    stack: [
      { name: "FastAPI", href: "https://fastapi.tiangolo.com/" },
      { name: "React", href: "https://react.dev/" },
      { name: "Python", href: "https://docs.python.org/3/" },
      { name: "Training Visualization", href: "https://d3js.org/" },
    ],
    highlights: [
      "Built with a team of 4 to provide configurable hyperparameter controls in a browser UI.",
      "Connected FastAPI training endpoints to real-time frontend charts for experiment monitoring.",
      "Optimized for local execution to keep iteration fast for exploratory workflows.",
    ],
    challenges:
      "The hardest part was keeping training-state updates consistent between backend jobs and frontend visual state during frequent parameter changes.",
    nextSteps: [
      "Add experiment versioning and comparison between multiple runs.",
      "Introduce resumable training jobs with checkpoint-aware UI state.",
    ],
    mermaidTitle: "Experiment Loop",
    mermaidChart: `
flowchart LR
  U[Researcher UI] --> C[Hyperparameter Config]
  C --> A[FastAPI Training API]
  A --> T[Training Worker]
  T --> M[Metrics Stream]
  M --> V[React Visualization]
  V --> U
`,
  },
  {
    anchor: "resume-analyzer",
    period: "2025",
    name: "Resume Analyzer",
    repo: "https://github.com/carols12352/resume-analyser",
    summary:
      "Resume evaluation app that integrates OpenAI APIs to generate structured, actionable feedback.",
    stack: [
      { name: "Python", href: "https://docs.python.org/3/" },
      { name: "Flask", href: "https://flask.palletsprojects.com/" },
      { name: "React", href: "https://react.dev/" },
      { name: "OpenAI API", href: "https://platform.openai.com/docs" },
    ],
    highlights: [
      "Built upload-to-feedback workflow with clear section-level output for resume improvements.",
      "Integrated OpenAI APIs to convert raw resume text into structured evaluation points.",
      "Focused on deterministic response formatting so users can iterate quickly.",
    ],
    challenges:
      "LLM-based feedback quality depends on prompt structure, output schema consistency, and robust handling of incomplete resume inputs.",
    nextSteps: [
      "Add scoring rubrics by role type (SWE, data, ML) for more context-aware feedback.",
      "Store revision history to compare resume quality improvements over time.",
    ],
    mermaidTitle: "Feedback Generation Sequence",
    mermaidChart: `
sequenceDiagram
  participant User
  participant React as React UI
  participant Flask as Flask API
  participant OpenAI as OpenAI API
  User->>React: Upload resume
  React->>Flask: Submit parsed content
  Flask->>OpenAI: Request structured feedback
  OpenAI-->>Flask: Return JSON suggestions
  Flask-->>React: Return formatted sections
  React-->>User: Render actionable report
`,
  },
  {
    anchor: "latex-template-resume",
    period: "2025",
    name: "LaTeX Resume Template",
    repo: "https://github.com/carols12352/latex-template-resume",
    summary:
      "A reusable LaTeX resume template focused on clean hierarchy, readable typography, and fast customization.",
    stack: [
      { name: "LaTeX", href: "https://www.latex-project.org/" },
      { name: "TeX Live", href: "https://www.tug.org/texlive/" },
      { name: "Overleaf", href: "https://www.overleaf.com/" },
    ],
    highlights: [
      "Designed a structured one-page resume layout with consistent spacing and section rhythm.",
      "Added simple, reusable macros to speed up editing across education, project, and experience sections.",
      "Kept the template lightweight so it compiles quickly and exports ATS-friendly PDFs.",
    ],
    challenges:
      "Balancing visual polish with ATS readability required careful control of formatting commands and text semantics.",
    nextSteps: [
      "Add alternate style presets for internship-focused and research-focused versions.",
      "Provide bilingual content placeholders to simplify English/Chinese resume maintenance.",
    ],
  },
  {
    anchor: "obsidian-oreo-theme",
    period: "2023-2024",
    name: "Obsidian Oreo Theme",
    repo: "https://github.com/carols12352/Oreo-theme",
    summary:
      "A custom Obsidian theme focused on readable contrast and a polished Oreo-inspired visual style.",
    stack: [
      { name: "CSS", href: "https://developer.mozilla.org/docs/Web/CSS" },
      { name: "HTML", href: "https://developer.mozilla.org/docs/Web/HTML" },
      { name: "Obsidian", href: "https://help.obsidian.md/Themes" },
    ],
    highlights: [
      "Designed and implemented a complete custom theme package for Obsidian.",
      "Published the theme with community adoption exceeding 3,000 downloads.",
      "Balanced aesthetics with practical readability for long-form note taking.",
    ],
    challenges:
      "Theme work required handling many edge UI states while keeping a coherent visual language across plugins and markdown content patterns.",
    nextSteps: [
      "Add broader plugin-specific style coverage and maintain compatibility across app updates.",
      "Ship accessibility-focused variants with stronger contrast presets.",
    ],
  },

];

type ProjectSectionProps = {
  index: number;
  project: ProjectEntry;
};

function ProjectSection({ index, project }: ProjectSectionProps) {
  return (
    <article
      id={project.anchor}
      className="mt-14 border-t border-gray-300 pt-8 first:mt-0 first:border-t-0 first:pt-0"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.1em] text-gray-500 uppercase">
            Project {String(index + 1).padStart(2, "0")}
          </p>
          <p className="mt-1 text-xs text-gray-500">{project.period}</p>
          <h2 className="text-lg font-semibold">{project.name}</h2>
        </div>
        <a
          href={project.repo}
          target="_blank"
          rel="noreferrer"
          className="ui-link ui-underline text-xs uppercase tracking-[0.08em]"
        >
          GitHub Repo
        </a>
      </div>

      <section className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Project Summary
        </h3>
        <p className="mt-2">{project.summary}</p>
      </section>

      <section className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Stack
        </h3>
        <ul className="evidence-strip mt-3">
          {project.stack.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="evidence-pill-link"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Delivered
        </h3>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          {project.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {project.mermaidChart && project.mermaidTitle ? (
        <MermaidDiagram chart={project.mermaidChart} title={project.mermaidTitle} />
      ) : null}

      {project.terminalLines && project.terminalTitle ? (
        <TerminalDemo title={project.terminalTitle} lines={project.terminalLines} />
      ) : null}

      <section className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Technical Challenge
        </h3>
        <p className="mt-2">{project.challenges}</p>
      </section>

      <section className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Next Iteration
        </h3>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          {project.nextSteps.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}

export default function ProjectsPage() {
  return (
    <>
      <section>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Projects
        </h1>
        <p className="mt-4 max-w-2xl">
          Project work aligned with my current resume, with architecture notes
          and implementation details from public repositories.
        </p>
      </section>

      {projectEntries.map((project, index) => (
        <ProjectSection key={project.name} index={index} project={project} />
      ))}
    </>
  );
}
