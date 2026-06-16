import type { Metadata } from "next";
import Link from "next/link";
import { ExperiencesTreeTimeline, type ExperienceEntry } from "@/components/experiences/experiences-tree-timeline";
import { buildSeoTitle, SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: buildSeoTitle("Experience"),
  description: "Professional and product experience by Sicheng Ouyang, including software engineering, applied ML, and product operations work.",
  alternates: {
    canonical: "/experiences",
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/experiences`,
    title: buildSeoTitle("Experience"),
    siteName: SITE_NAME,
    description: "Professional and product experience by Sicheng Ouyang, including software engineering, applied ML, and product operations work.",
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: buildSeoTitle("Experience"),
    description: "Professional and product experience by Sicheng Ouyang, including software engineering, applied ML, and product operations work.",
    images: [SITE_OG_IMAGE],
  },
};

const experienceEntries: ExperienceEntry[] = [
  {
    anchor: "mui-scientific",
    period: "2026.04 - Present",
    role: "Software Engineer",
    organization: "Mui Scientific",
    summary:
      "Building internal inventory tooling, refining standard operating procedures, and reshaping the public website for a growing medical device company.",
    stack: [
      { name: "TypeScript", href: "https://www.typescriptlang.org/" },
      { name: "React", href: "https://react.dev/" },
      { name: "Next.js", href: "https://nextjs.org/" },
      { name: "Operations Tooling", href: "https://en.wikipedia.org/wiki/Operations_management" },
    ],
    highlights: [
      "Worked on a new inventory system to make internal device and material tracking easier to operate.",
      "Helped refine standard operating procedures so technical workflows could be documented and repeated more consistently.",
      "Updated website structure and presentation to better match the company's product and operational direction.",
    ],
    focus:
      "The work sits between engineering and operations: the product needs to be simple enough for repeated daily use, but structured enough to support traceability as the company grows.",
    outcomes: [
      "Strengthened my understanding of how software supports physical-product operations.",
      "Practiced turning informal internal workflows into clearer interfaces, records, and procedures.",
    ],
  },
  {
    anchor: "tencent-music",
    period: "2024.06 - 2024.08",
    role: "Machine Learning Engineer",
    organization: "Tencent Music Entertainment",
    summary:
      "Evaluated speech synthesis models through repeated experiments and helped improve vocal consistency for generated audio.",
    stack: [
      { name: "Python", href: "https://docs.python.org/3/" },
      { name: "Speech Synthesis", href: "https://en.wikipedia.org/wiki/Speech_synthesis" },
      { name: "Model Evaluation", href: "https://en.wikipedia.org/wiki/Evaluation_of_binary_classifiers" },
      { name: "Experiment Tracking", href: "https://en.wikipedia.org/wiki/Experiment" },
    ],
    highlights: [
      "Evaluated 10 speech synthesis models across 20+ experiments.",
      "Compared model behavior using repeated test cases instead of one-off listening checks.",
      "Contributed to a measured 20% improvement in vocal consistency.",
    ],
    focus:
      "The core challenge was making subjective audio quality easier to compare through repeatable experiments and concrete evaluation notes.",
    outcomes: [
      "Built a stronger habit of treating ML work as an evaluation loop, not just model execution.",
      "Learned how small changes in data, prompts, and evaluation criteria can shift perceived output quality.",
    ],
  },
  {
    anchor: "a-level-study-platform",
    period: "2023.09 - 2025.08",
    role: "Co-Founder and Product Builder",
    organization: "Adv-A Level Study Platform",
    summary:
      "Co-founded and operated an A-Level study platform on Tencent Cloud, reaching roughly 1,000 daily active users.",
    stack: [
      { name: "WordPress", href: "https://wordpress.org/" },
      { name: "MySQL", href: "https://www.mysql.com/" },
      { name: "Tencent Cloud", href: "https://www.tencentcloud.com/" },
      { name: "HTML/CSS", href: "https://developer.mozilla.org/docs/Learn/Getting_started_with_the_web/HTML_basics" },
    ],
    highlights: [
      "Set up and maintained the platform on a Linux server hosted on Tencent Cloud.",
      "Used WordPress and MySQL to ship content and site changes quickly.",
      "Operated the site through real usage growth, reaching about 1,000 daily active users.",
    ],
    focus:
      "This was my first long-running product operation loop: performance, content structure, discoverability, and user experience all mattered because real students used the site every day.",
    outcomes: [
      "Learned how infrastructure choices directly affect user experience and retention.",
      "Developed a product-first engineering mindset from running something with real traffic.",
    ],
    link: "/writing/my-first-website",
  },
  {
    anchor: "mobile-maps-and-data",
    period: "2023.06-2023.08",
    role: "Software Engineer",
    organization: "Map Uncharted",
    summary:
      "Built a React Native map app with location visualization while also running handwriting recognition data experiments.",
    stack: [
      { name: "React Native", href: "https://reactnative.dev/" },
      { name: "JavaScript", href: "https://developer.mozilla.org/docs/Web/JavaScript" },
      { name: "Mobile Maps", href: "https://developers.google.com/maps/documentation" },
      { name: "Machine Learning", href: "https://scikit-learn.org/stable/" },
    ],
    highlights: [
      "Built location visualization and map interaction flows in a React Native app.",
      "Optimized trail storage and rendering to keep map interactions responsive.",
      "Ran handwriting recognition experiments and reached 96% accuracy.",
    ],
    focus:
      "The work combined frontend responsiveness with data experimentation: map UI performance needed practical optimization, while recognition accuracy needed repeated test-and-measure cycles.",
    outcomes: [
      "Gained early experience debugging performance on mobile-style interfaces.",
      "Built confidence in measuring model behavior through data experiments instead of relying on intuition.",
    ],
  },
  {
    anchor: "Wuhan-University-of-Technology",
    period: "2023.06-2023.08",
    role: "Software Engineer",
    organization: "Wuhan University of Technology",
    summary:
      "Deployed a local DeepSeek setup that was used by 20 researchers, focusing on practical access to local AI tooling.",
    stack: [
      { name: "Python", href: "https://docs.python.org/3/" },
      { name: "DeepSeek", href: "https://www.deepseek.com/" },
      { name: "Local Deployment", href: "https://en.wikipedia.org/wiki/Software_deployment" },
      { name: "Developer Tooling", href: "https://en.wikipedia.org/wiki/Programming_tool" },
    ],
    highlights: [
      "Prepared a local DeepSeek environment for research usage.",
      "Supported access for a group of 20 researchers.",
      "Focused on a setup that could be used reliably without depending on a polished external product flow.",
    ],
    focus:
      "The practical requirement was not only getting a model to run, but making the setup usable for people who needed to work with it repeatedly.",
    outcomes: [
      "Learned how local AI tooling depends on documentation, environment setup, and predictable runtime behavior.",
      "Connected ML experimentation with the operational details needed for real users.",
    ],
  },
];

type ExperiencesPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function ExperiencesPage({ searchParams }: ExperiencesPageProps) {
  const resolvedSearchParams = await searchParams;
  const rawQuery = resolvedSearchParams.q;
  const queryValue = Array.isArray(rawQuery) ? rawQuery[0] : rawQuery;
  const query = (queryValue ?? "").trim();
  const normalizedQuery = query.toLowerCase();

  const buildSnippet = (experience: ExperienceEntry, raw: string) => {
    if (!raw) {
      return experience.summary;
    }
    const source = [
      experience.summary,
      experience.role,
      experience.organization,
      experience.focus,
      ...experience.highlights,
      ...experience.outcomes,
      ...experience.stack.map((item) => item.name),
    ]
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    const lower = source.toLowerCase();
    const index = lower.indexOf(raw);
    if (index < 0) {
      return experience.summary;
    }
    const start = Math.max(0, index - 68);
    const end = Math.min(source.length, index + raw.length + 92);
    const snippet = source.slice(start, end).trim();
    const prefix = start > 0 ? "... " : "";
    const suffix = end < source.length ? " ..." : "";
    return `${prefix}${snippet}${suffix}`;
  };

  const visibleExperiences = normalizedQuery
    ? experienceEntries
      .filter((experience) => {
        const haystack = [
          experience.role,
          experience.organization,
          experience.summary,
          experience.focus,
          ...experience.highlights,
          ...experience.outcomes,
          ...experience.stack.map((item) => item.name),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .map((experience) => ({
        ...experience,
        summary: buildSnippet(experience, normalizedQuery),
      }))
    : experienceEntries;

  return (
    <>
      <section>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Experiences
        </h1>
        <p className="mt-4 max-w-2xl">
          Work and product experience from my current resume, organized as a timeline with implementation notes,
          measurable outcomes, and the stack behind each role.
        </p>
        {query ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            <p>
              Search: <span className="font-medium text-gray-700">{query}</span>
            </p>
            <Link href="/experiences" className="ui-link ui-underline">
              Clear search
            </Link>
          </div>
        ) : null}
      </section>

      {visibleExperiences.length === 0 ? (
        <section className="mt-12 ui-item border-t border-gray-200 pt-4">
          <h2 className="text-lg font-semibold text-gray-900">No results</h2>
          <p className="mt-3 text-gray-600">
            No experiences matched <span className="font-medium">{query}</span>.
          </p>
        </section>
      ) : (
        <ExperiencesTreeTimeline experiences={visibleExperiences} searchQuery={query} />
      )}
    </>
  );
}
