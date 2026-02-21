import type { Metadata } from "next";
import { buildSeoTitle, SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: buildSeoTitle("About Sicheng Ouyang and Engineering Background"),
  description: "About Sicheng Ouyang: background, engineering approach, experience highlights, and technical skill set.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/about`,
    title: buildSeoTitle("About Sicheng Ouyang and Engineering Background"),
    siteName: SITE_NAME,
    description: "About Sicheng Ouyang: background, engineering approach, experience highlights, and technical skill set.",
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: buildSeoTitle("About Sicheng Ouyang and Engineering Background"),
    description: "About Sicheng Ouyang: background, engineering approach, experience highlights, and technical skill set.",
    images: [SITE_OG_IMAGE],
  },
};

export default function AboutPage() {
  return (
    <>
      <section>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          About
        </h1>
        <p className="mt-4 max-w-2xl">
          Hi there! I&apos;m Sicheng Ouyang, a Software Engineering student at the University of Waterloo (Sep 2025 - 2030).
          I like building full stack web apps and exploring practical ML applications. I have experience in backend systems, ML workflows, and product delivery from my own projects and several internships. And I&apos;m passionate about learning from production data and iterating quickly in real environments.
        </p>
        <p className="mt-4 max-w-2xl">
          I&apos;m especially interested in bridging robust backend architecture with clean, minimal user experience, and I care a lot about reliability and clear system behavior as products scale.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Experience Highlights</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Co-founded and built an A-Level study platform on Tencent Cloud, reaching roughly 1,000 daily active users.</li>
          <li>At Tencent Music, evaluated 10 speech synthesis models across 20+ experiments and improved vocal consistency by 20%.</li>
          <li>Built a React Native map app with location visualization and optimized trail storage/rendering for better performance.</li>
          <li>Ran handwriting recognition data experiments to 96% accuracy and deployed a local DeepSeek setup used by 20 researchers.</li>
          <li>My usual learning loop is: read docs/papers, build a small prototype, evaluate with measurable results or simply just act as a daily user, then iterate quickly.</li>
          <li>As a builder and operator, I also care about user experience and cost-performance tradeoffs, I do consider that as my top priority when I build a product.</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Skills Snapshot</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Languages: Python, Java, C/C++, JavaScript, TypeScript, HTML/CSS.</li>
          <li>Frameworks/Tools: FastAPI, Flask, React, React Native, MySQL, Git, WordPress, LaTeX, Node.js.</li>
          <li>Languages spoken: English (fluent), Mandarin Chinese (native), French (basic).</li>
        </ul>
      </section>
      
      <section className="mt-12">
        <h2 className="text-lg font-semibold">More About Me</h2>
          <p className="mt-4">
            Besides all of the coding, I am also a big fan of going to the gym and play tennis, FPS games are also a fun way for me to relax and connect with friends. I also enjoy traveling and exploring new places, especially if there are good food around!
          </p>
        </section>
        <section className="about-note-card mt-12 rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold">Note</h2>
        <p className="mt-3">
          Thank you for reading all of this! If you&apos;ve comed this far into the website, maybe try the terminal puzzle I built up on the &gt;_ section, there are three different animations in it and I put many effort in making it.
        </p>
      </section>
    </>
  );
}
