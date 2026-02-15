type ProjectSectionProps = {
  name: string;
  why: string;
  architecture: string;
  challenges: string;
  improvements: string[];
};

function ProjectSection({
  name,
  why,
  architecture,
  challenges,
  improvements,
}: ProjectSectionProps) {
  return (
    <article className="mt-12 first:mt-0">
      <h2 className="text-lg font-semibold">{name}</h2>

      <section className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Why It Exists
        </h3>
        <p className="mt-2">{why}</p>
      </section>

      <section className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Architecture Decisions
        </h3>
        <p className="mt-2">{architecture}</p>
      </section>

      <section className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Technical Challenges
        </h3>
        <p className="mt-2">{challenges}</p>
      </section>

      <section className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Improvements Over Time
        </h3>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          {improvements.map((item) => (
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
          Selected systems with focus on design decisions, trade-offs, and
          iterative improvement.
        </p>
      </section>

      <ProjectSection
        name="Realtime Chat Infrastructure"
        why="Built to support reliable low-latency messaging across unstable client networks while keeping operational complexity manageable for a small team."
        architecture="Started with a single Node.js service and relational persistence. Moved to an event-driven pipeline with explicit message states, idempotent writes, and separate delivery workers as traffic and failure modes became clearer."
        challenges="The main challenge was balancing ordering guarantees against horizontal scalability. We accepted per-conversation ordering instead of global ordering to avoid a central bottleneck."
        improvements={[
          "v1: Single process with in-memory session tracking and direct socket fan-out.",
          "v2: Introduced durable queue and delivery acknowledgements for reconnect safety.",
          "v3: Split ingest and delivery paths, added replay and backpressure controls.",
        ]}
      />

      <ProjectSection
        name="Developer Workflow Automation"
        why="Created to reduce repetitive local setup and release operations that were slowing iteration speed and introducing avoidable mistakes."
        architecture="Designed as a small CLI with composable commands and explicit environment checks. Chose plain TypeScript modules over heavy framework abstractions to keep behavior predictable and debuggable."
        challenges="Cross-platform command behavior and state drift between local and CI environments required careful normalization and deterministic command boundaries."
        improvements={[
          "v1: Script collection with ad-hoc conventions.",
          "v2: Unified CLI entrypoint with typed options and consistent output format.",
          "v3: Added dry-run mode, validation gates, and CI parity checks.",
        ]}
      />
    </>
  );
}
