import type { Metadata } from "next";
import Link from "next/link";
import { AutoGrowthLine } from "@/components/home/auto-growth-line";
import { HoverCard } from "@/components/motion/hover-card";
import { RevealItem, RevealSection, RevealStagger } from "@/components/motion/reveal";
import { buildSeoTitle, SITE_DESCRIPTION, SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: buildSeoTitle("Software Engineering Portfolio"),
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: buildSeoTitle("Software Engineering Portfolio"),
    siteName: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: buildSeoTitle("Software Engineering Portfolio"),
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
};

const focusItems = [
  {
    title: "Backend Systems",
    description:
      "I build mostly using Typescript and Python(actively discovering new languages), focusing on accurate error handing, clear data ownership and clear API routes",
  },
  {
    title: "Applied ML",
    description:
      "I love fine-tuning and evaluating open-source models for practical use cases, and have a lot of fun with muti-agent experiments and prompt engineering.",
  },
  {
    title: "Practical Product Delivery",
    description:
      "Turning prototypes into actual usable products across web, mobile, and desktop with measurable user outcomes and feedbacks.",
  },
  {
    title: "Light Weight Developer Tooling",
    description:
      "I like making small but useful tools that improve my daily productivity, and I prefer simple scripts and local setups over complex platforms and cloud services for most use cases.",
  },
];

const selectedWork = [
  {
    title: "Chat WebSocket Demo",
    description:
      "FastAPI + WebSocket + PostgreSQL + Next.js with JWT auth, email verification, and incremental message sync.",
    href: "/projects#chat-websocket-demo",
  },
  {
    title: "Todo List Web & Desktop App",
    description:
      "React + Flask + MySQL task system with cross-platform tray app packaging for macOS and Windows, with a finetuned BERT model for natural language processing.",
    href: "/projects#todo-list-web-desktop-app",
  },
  {
    title: "Resume Analyzer",
    description:
      "Flask + React tool integrated with OpenAI API for structured resume evaluation and actionable feedback.",
    href: "/projects#resume-analyzer",
  },
];

const growthTimeline = [
  {
    phase: "2023",
    period: "Mobile + Data Foundations",
    detail: "Built a React Native maps app with storage/render optimizations and ran handwriting recognition experiments up to 96% accuracy.",
  },
  {
    phase: "2024",
    period: "ML Internship (Tencent Music)",
    detail: "Evaluated 10 speech synthesis models with 20+ experiments and delivered a 20% gain in vocal consistency.",
  },
  {
    phase: "2023-2025",
    period: "Co-Founder Product Build",
    detail: "Built and operated an A-Level study platform (WordPress + MySQL + Tencent Cloud) with about 1,000 daily active users.",
  },
  {
    phase: "2025",
    period: "Graduation",
    detail: "I graduated from High School! On to university and new adventures!",
  },
  {
    phase: "Now",
    period: "Software Engineering @ UWaterloo",
    detail: "Deepening systems, maths and algorithm foundations while continuing full-stack projects delivery and exploring other applications",
  },
];

export default function Home() {
  const commitSha =
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
    process.env.NEXT_PUBLIC_GIT_COMMIT_SHA ??
    "";
  const shortSha = commitSha ? commitSha.slice(0, 7) : "";
  const buildLabel = shortSha ? `build ${shortSha}` : "local build";
  const buildHref = commitSha
    ? `https://github.com/carols12352/sicheng/commit/${commitSha}`
    : "";

  return (
    <div className="home-canvas home-load-enter">
      <RevealSection
        tone="hero"
        className="home-band home-hero home-hero-sweep flex min-h-0 items-center px-6 py-8 sm:min-h-[calc(100svh-8.5rem)] sm:px-10 sm:py-14 lg:px-14"
      >
        <div className="home-hero-grid mx-auto w-full max-w-6xl">
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
              <p>
              Software Engineering @{" "}
              <a
                href="https://uwaterloo.ca/future-students/programs/software-engineering"
                target="_blank"
                rel="noreferrer"
                className="ui-link"
              >
                UWaterloo
              </a>
              </p>
              <span className="text-gray-400" aria-hidden>
                ·
              </span>
              {buildHref ? (
                <a href={buildHref} target="_blank" rel="noreferrer" className="home-build-tag home-build-live ui-link ui-underline">
                  {buildLabel}
                </a>
              ) : (
                <span className="home-build-tag home-build-live">{buildLabel}</span>
              )}
            </div>

            <h1 className="home-hero-title mt-4 text-gray-900">
              Sicheng Ouyang
            </h1>
            <span aria-hidden className="mt-5 block h-px w-20 bg-gray-300" />
            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
              Software Engineering student at UWaterloo focused on reliable backend systems, practical ML workflows, and product delivery.
            </p>

            <div className="home-hero-actions mt-8 flex-col sm:flex-row">
              <Link href="/projects" className="home-btn home-btn-primary w-full sm:w-auto">
                View Projects
              </Link>
              <Link href="/writing" className="home-btn home-btn-ghost w-full sm:w-auto">
                Read Writing
              </Link>
            </div>
          </div>

          <div className="home-hero-panel">
            <p className="home-hero-panel-title">Growth Line</p>
            <AutoGrowthLine items={growthTimeline} />
          </div>
        </div>
      </RevealSection>

      <RevealSection className="home-band home-section px-6 py-[4.5rem] sm:px-10 sm:py-[5.5rem] lg:px-14">
        <div className="capability-layout mx-auto w-full max-w-6xl">
          <div>
            <h2 className="section-title">What I Do</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-600">
              Engineering focus areas that guide how I design systems, ship features, and iterate in production.
            </p>
          </div>
          <RevealStagger className="capability-rail">
            {focusItems.map((item, index) => (
              <RevealItem key={item.title} className="capability-row ui-item">
                <div className="flex gap-4">
                  <p className="capability-index">0{index + 1}</p>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </RevealSection>

      <RevealSection className="home-band home-section px-6 pb-[4.5rem] pt-[3.5rem] sm:px-10 sm:pb-[5.5rem] sm:pt-[4rem] lg:px-14">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex items-end justify-between gap-4">
            <h2 className="section-title">Selected Work</h2>
            <Link href="/projects" className="ui-link ui-underline text-sm">
              View all projects
            </Link>
          </div>
          <RevealStagger className="work-layout mt-6">
            {selectedWork.map((item, index) => (
              <RevealItem key={item.title} className={index === 0 ? "work-feature" : "work-side"}>
                <HoverCard>
                  <Link
                    href={item.href}
                    className={`work-link ui-item block ${index === 0 ? "work-link-feature" : ""}`}
                  >
                    <p className="work-meta">Project {index + 1}</p>
                    <h3 className="mt-2 text-base font-semibold text-gray-900">{item.title}</h3>
                    <p className="mt-4 text-sm leading-6 text-gray-600">
                      {item.description}
                    </p>
                  </Link>
                </HoverCard>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </RevealSection>
    </div>
  );
}
