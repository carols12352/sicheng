import type { Metadata } from "next";
import Link from "next/link";
import { AutoGrowthLine } from "@/components/home/auto-growth-line";
import { HoverCard } from "@/components/motion/hover-card";
import { RevealItem, RevealSection, RevealStagger } from "@/components/motion/reveal";
import { growthTimeline } from "@/content/growth";
import { buildPageMetadata, SITE_DESCRIPTION } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Software Engineering Portfolio",
  description: SITE_DESCRIPTION,
  path: "",
});

const focusItems = [
  {
    title: "Backend Systems",
    description:
      "I mainly use TypeScript and Python, with an emphasis on error handling, clear data ownership, and predictable APIs.",
  },
  {
    title: "Applied ML",
    description:
      "I fine-tune and evaluate open-source models, and experiment with multi-agent systems and prompting.",
  },
  {
    title: "Practical Product Delivery",
    description:
      "I turn prototypes into usable web, mobile, and desktop products, then improve them with real feedback.",
  },
  {
    title: "Lightweight Developer Tooling",
    description:
      "I build small tools for daily work and prefer simple scripts or local setups when they are enough.",
  },
];

const selectedWork = [
  {
    title: "The Cobalt Guide",
    description:
      "Canada-wide rewards discovery platform with geospatial search, protected reporting workflows, and automated CI/CD checks.",
    href: "/projects#the-cobalt-guide",
  },
  {
    title: "Personal Site",
    description:
      "Next.js App Router portfolio with technical writing, SEO metadata, dynamic sitemap generation, and interactive easter eggs.",
    href: "/projects#personal-site",
  },
];

const pastExperiences = [
  {
    role: "Software Engineer",
    organization: "Mui Scientific",
    period: "2026.04 - 2026.08",
    description:
      "Built internal inventory tooling, refined standard operating procedures, and reshaped the public website for a growing medical device company.",
    href: "/experiences#mui-scientific",
  },
  {
    role: "Machine Learning Engineer",
    organization: "Tencent Music Entertainment",
    period: "2024.06 - 2024.08",
    description:
      "Evaluated speech synthesis models through repeated experiments and helped improve vocal consistency for generated audio.",
    href: "/experiences#tencent-music",
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
        className="home-band home-hero home-hero-sweep flex min-h-0 items-center px-6 py-8 sm:min-h-[min(38rem,calc(100svh-15rem))] sm:px-10 sm:py-14 lg:px-14"
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
              <span className="text-gray-400">
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

            <h1 className="home-hero-title mt-5 text-gray-900">
              Sicheng Ouyang
            </h1>
            <span className="mt-6 block h-px w-20 bg-gray-300" />
            <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
              Software Engineering student at UWaterloo focused on reliable backend systems, practical ML workflows, and product delivery.
            </p>

            <div className="home-hero-actions mt-9 flex-col sm:flex-row">
              <Link href="/projects" className="home-btn home-btn-primary w-full sm:w-auto">
                View Projects
              </Link>
              <Link href="/writing" className="home-btn home-btn-ghost w-full sm:w-auto">
                Read Writing
              </Link>
              <Link href="/immersive" className="home-btn home-btn-ghost w-full sm:w-auto">
                Try it in VR
              </Link>
            </div>
            <p className="pt-4 text-xs text-gray-500">
              VR works on Apple Vision Pro, Meta Quest, and any WebXR headset.
            </p>
          </div>

          <div className="home-hero-panel">
            <p className="home-hero-panel-title">Growth Line</p>
            <AutoGrowthLine items={growthTimeline} />
          </div>
        </div>
      </RevealSection>

      <section className="home-band home-section px-6 py-[4.5rem] sm:px-10 sm:py-[5.5rem] lg:px-14">
        <div className="capability-layout mx-auto w-full max-w-6xl">
          <div>
            <h2 className="section-title">What I Do</h2>
            <p className="mt-5 max-w-sm text-sm leading-6 text-gray-600">
              The areas I spend most of my time building and learning.
            </p>
          </div>
          <RevealStagger className="capability-rail">
            {focusItems.map((item, index) => (
              <RevealItem key={item.title} className="capability-row ui-item" variant="capability">
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
      </section>

      <RevealSection className="home-band home-section px-6 pb-8 pt-[3.5rem] sm:px-10 sm:pb-10 sm:pt-[4rem] lg:px-14">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex items-end justify-between gap-4">
            <h2 className="section-title">Selected Work</h2>
            <Link href="/projects" className="ui-link ui-underline text-sm">
              View all projects
            </Link>
          </div>
          <RevealStagger className="work-layout mt-7">
            {selectedWork.map((item, index) => (
              <RevealItem key={item.title} className="work-side">
                <HoverCard>
                  <Link
                    href={item.href}
                    className="work-link ui-item block"
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

      <RevealSection className="home-band home-section home-section-connected px-6 py-[4.5rem] sm:px-10 sm:py-[5.5rem] lg:px-14">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex items-end justify-between gap-4">
            <h2 className="section-title">Experience</h2>
            <Link href="/experiences" className="ui-link ui-underline text-sm">
              View all experience
            </Link>
          </div>
          <RevealStagger className="work-layout mt-7">
            {pastExperiences.map((item) => (
              <RevealItem key={`${item.organization}-${item.role}`} className="work-side">
                <HoverCard>
                  <Link href={item.href} className="work-link ui-item block">
                    <p className="work-meta">{item.period}</p>
                    <h3 className="mt-2 text-base font-semibold text-gray-900">{item.role}</h3>
                    <p className="mt-1 text-sm text-gray-500">{item.organization}</p>
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
