export default function AboutPage() {
  return (
    <>
      <section>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          About
        </h1>
        <p className="mt-4 max-w-2xl">
          Hello! I&apos;m Sicheng Ouyang, a 1B software engineering student at the University of Waterloo.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">How I Build</h2>
        <p className="mt-4">
          I start by defining failure boundaries, data ownership, and explicit
          interfaces. I prefer simple architectures first, then scale complexity
          only when production behavior proves the need.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Engineering Priorities</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Correctness over hidden shortcuts.</li>
          <li>Clear operational behavior under load and failure.</li>
          <li>Incremental evolution instead of large rewrites.</li>
          <li>Documentation and tests that support future maintainers.</li>
        </ul>
      </section>
    </>
  );
}
