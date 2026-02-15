export default function AboutPage() {
  return (
    <>
      <section>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          About
        </h1>
        <p className="mt-4 max-w-2xl">
          I&apos;m Sicheng Ouyang, a Software Engineering student at the University of Waterloo (Sep 2025 - present).
          I build backend-heavy products with practical ML integrations across web, mobile, and desktop.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Experience Highlights</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Co-founded and built an A-Level study platform on Tencent Cloud, reaching roughly 1,000 daily active users.</li>
          <li>At Tencent Music, evaluated 10 speech synthesis models across 20+ experiments and improved vocal consistency by 20%.</li>
          <li>Built a React Native map app with location visualization and optimized trail storage/rendering for better performance.</li>
          <li>Ran handwriting recognition data experiments to 96% accuracy and deployed a local DeepSeek setup used by 20 researchers.</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">How I Build</h2>
        <p className="mt-4">
          I start from interfaces, failure boundaries, and explicit data flow.
          I prefer simple and debuggable designs first, then increase complexity
          only when production behavior shows clear need.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Skills Snapshot</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Languages: Python, Java, C++, JavaScript, TypeScript, HTML/CSS.</li>
          <li>Frameworks/Tools: FastAPI, Flask, React, React Native, MySQL, Git, WordPress, LaTeX.</li>
          <li>Working style: measurable iteration, clean interfaces, and production-aware implementation details.</li>
          <li>Languages spoken: English (fluent), Mandarin Chinese (native), French (basic).</li>
        </ul>
      </section>
    </>
  );
}
