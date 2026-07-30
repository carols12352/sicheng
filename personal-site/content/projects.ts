import type { ProjectEntry } from "@/components/projects/projects-tree-timeline";

export const projectEntries: ProjectEntry[] = [
  {
    anchor: "the-cobalt-guide",
    period: "2026.05 - Present",
    name: "The Cobalt Guide",
    repo: "https://github.com/carols12352/thecobaltguide",
    summary:
      "A Canada-wide rewards discovery platform with location-aware search, protected community reporting, and automated delivery checks.",
    stack: [
      { name: "Next.js", href: "https://nextjs.org/" },
      { name: "TypeScript", href: "https://www.typescriptlang.org/" },
      { name: "Supabase", href: "https://supabase.com/" },
      { name: "PostGIS", href: "https://postgis.net/" },
      { name: "MapLibre", href: "https://maplibre.org/" },
      { name: "Redis", href: "https://redis.io/" },
    ],
    highlights: [
      "Built a Canada-wide rewards discovery experience using Supabase PostGIS for geospatial data and MapLibre for interactive maps.",
      "Secured API endpoints and community reporting workflows with Supabase Auth, row-level security, and Redis-backed rate limiting.",
      "Implemented GitHub Actions CI/CD covering ESLint, Vitest unit tests, Playwright end-to-end tests, Supabase RLS tests, Vercel deployment, and comment-triggered performance evaluations.",
    ],
    challenges:
      "Keeping location search fast while applying the same authorization and abuse controls to public and signed-in users.",
    mermaidTitle: "Discovery and Delivery Flow",
    mermaidChart: `
flowchart LR
  U[Next.js Client] --> M[MapLibre]
  U --> A[Supabase Auth]
  U --> API[Protected APIs]
  API --> R[Redis Rate Limiting]
  API --> DB[(Supabase PostGIS)]
  CI[GitHub Actions] --> T[Unit + E2E + RLS Tests]
  T --> V[Vercel Deployment]
`,
  },
  {
    anchor: "pitch-deck",
    period: "2026.02-2026.04",
    name: "Management Panel Pitch Deck",
    summary:
      "An internal sales tool for company research, lead tracking, and personalized outreach.",
    stack: [
      { name: "Next.js", href: "https://nextjs.org/" },
      { name: "React", href: "https://react.dev/" },
      { name: "TypeScript", href: "https://www.typescriptlang.org/" },
      { name: "Tailwind CSS", href: "https://tailwindcss.com/" },
    ],
    highlights: [
      "Parsed bills of materials from PDFs and Excel files into traceable company records.",
      "Built a research pipeline that identified company stage, likely pain points, and decision-maker contacts with over 90% test accuracy.",
      "Generated personalized outreach from each company's pain points and improved deliverability through message and sender controls.",
    ],
    challenges:
      "Shipping quickly without sacrificing accuracy across inconsistent PDFs, spreadsheets, and website data.",
  },
  {
    anchor: "personal-site",
    period: "2026.01 - Present",
    name: "Personal Site (This Website)",
    repo: "https://github.com/carols12352/sicheng",
    summary:
      "My personal portfolio site built with Next.js App Router, combining content presentation, technical writing, and interactive easter eggs.",
    stack: [
      { name: "Next.js", href: "https://nextjs.org/" },
      { name: "React", href: "https://react.dev/" },
      { name: "TypeScript", href: "https://www.typescriptlang.org/" },
      { name: "Framer Motion", href: "https://www.framer.com/motion/" },
      { name: "MDX", href: "https://mdxjs.com/" },
    ],
    highlights: [
      "Designed a content-first portfolio with dedicated sections for projects, writing, and resume.",
      "Implemented SEO metadata, robots rules, and dynamic sitemap generation for better search visibility.",
      "Built interactive terminal and custom 404 experience to add personality without affecting core navigation.",
    ],
    challenges:
      "Keeping playful interactions fast, accessible, and easy for search engines to index.",
  },
  {
    anchor: "chat-websocket-demo",
    period: "2025.12 - 2026.02",
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
      "Keeping message history, authentication, and live updates consistent after reconnects.",
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
    period: "2025.10 - 2026.01",
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
      "Keeping web and desktop behavior consistent while normalizing ambiguous natural-language input.",
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
    period: "2025.08 - 2025.09",
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
      "Making every command predictable and keeping terminal output easy to scan.",
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
    period: "2025.06 - 2025.07",
    name: "Nurel AI Playground",
    demo: "https://nurel.app/",
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
      "Keeping backend training jobs and frontend charts in sync while parameters changed.",
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
    period: "2025.03 - 2025.05",
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
      "Producing consistent feedback when resumes were incomplete or formatted differently.",
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
    period: "2025.02 - 2025.03",
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
      "Balancing visual polish with readable text structure for applicant tracking systems.",
  },
  {
    anchor: "obsidian-oreo-theme",
    period: "2023.09 - 2024.02",
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
      "Covering edge states across Obsidian and its plugins without losing visual consistency.",
  },
];
