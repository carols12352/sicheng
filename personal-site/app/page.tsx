import Link from "next/link";
import { RevealItem, RevealSection, RevealStagger } from "@/components/motion/reveal";

const focusItems = [
  {
    title: "Full-Stack System Design",
    description:
      "I approach features as complete systems rather than isolated components, thinking through data flow, API contracts, state management, and how frontend and backend interact over time.",
  },
  {
    title: "User Experience on Top",
    description:
      "I care about how systems feel in actually use — responsiveness, consistency, and clarity — making sure technical decisions ultimately serve real user behavior.",
  },
  {
    title: "Applied AI/ML",
    description:
      "I focus on practical AI integration, evaluating models, tuning inputs and outputs, and building pipelines that turn messy user input into structured, reliable results.",
  },
  {
    title: "From Start to Finish",
    description:
      "I enjoy taking ideas from prototype to deployment, handling authentication, persistence, iteration, and real-world feedback without relying on large rewrites.",
  },
];

const selectedWork = [
  {
    title: "Realtime Chat Infrastructure",
    description:
      "Evolved from a single service into a queue-backed delivery pipeline.",
    href: "/projects",
  },
  {
    title: "Engineering Workflow CLI",
    description:
      "Unified setup and release commands with validation and dry-run modes.",
    href: "/projects",
  },
  {
    title: "Reliability Notes",
    description:
      "Writing on boundary decisions, trade-offs, and production feedback loops.",
    href: "/writing",
  },
];

export default function Home() {
  return (
    <>
      <RevealSection tone="hero">
        <p className="text-sm text-gray-500">
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
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          Sicheng Ouyang
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-700">
          Student at UWaterloo software engineering class of 2030, interested in full-stack web development, applied AI/ML.
        </p>
      </RevealSection>

      <RevealSection className="mt-20">
        <h2 className="text-lg font-semibold text-gray-900">What I Do</h2>
        <RevealStagger className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {focusItems.map((item) => (
            <RevealItem key={item.title} className="ui-item border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {item.description}
              </p>
            </RevealItem>
          ))}
        </RevealStagger>
      </RevealSection>

      <RevealSection className="mt-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Selected Work</h2>
          <Link href="/projects" className="ui-link ui-underline text-sm">
            View all projects
          </Link>
        </div>
        <RevealStagger className="mt-6 space-y-5">
          {selectedWork.map((item) => (
            <RevealItem key={item.title}>
              <Link
                href={item.href}
                className="ui-item block border-t border-gray-200 pt-4"
              >
                <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {item.description}
                </p>
              </Link>
            </RevealItem>
          ))}
        </RevealStagger>
      </RevealSection>
    </>
  );
}
