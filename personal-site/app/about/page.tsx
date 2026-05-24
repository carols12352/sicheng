import type { Metadata } from "next";
import Image from "next/image";
import { SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: `About Sicheng Ouyang | ${SITE_NAME}`,
  description: "About Sicheng Ouyang: software engineering background, current technical focus, experience highlights, and working style.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/about`,
    title: `About Sicheng Ouyang | ${SITE_NAME}`,
    siteName: SITE_NAME,
    description: "About Sicheng Ouyang: software engineering background, current technical focus, experience highlights, and working style.",
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `About Sicheng Ouyang | ${SITE_NAME}`,
    description: "About Sicheng Ouyang: software engineering background, current technical focus, experience highlights, and working style.",
    images: [SITE_OG_IMAGE],
  },
};

export default function AboutPage() {
  return (
    <>
      <section className="grid gap-7 md:grid-cols-[minmax(0,35rem)_16rem] md:items-start">
        <div>
          <h1 className="sr-only">About Sicheng Ouyang</h1>
          <p className="max-w-2xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
            <span className="text-2xl font-semibold leading-normal text-gray-900 sm:text-3xl">
              I&apos;m Sicheng Ouyang,
            </span>{" "}
            a Software Engineering student at the University of Waterloo,
            Class of 2030. I&apos;m interested in building high-performance
            software and AI systems that combine strong engineering foundations
            with intelligent behavior.
          </p>
          <div className="mt-8 hidden items-center gap-4 text-sm text-gray-500 md:flex">
            <span className="h-px w-20 bg-gray-300" />
            <span>this is me</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 104 40"
              className="h-10 w-28 text-gray-400"
              fill="none"
            >
              <path
                d="M3 31C28 12 62 5 95 13"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
              <path
                d="M86 5L96 13L84 20"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        <div className="relative aspect-[4/5] w-full max-w-[16rem] overflow-hidden rounded-md border border-gray-200 bg-gray-100 shadow-sm md:justify-self-end">
          <Image
            src="/about-portrait.png"
            alt="Portrait of Sicheng Ouyang"
            fill
            priority
            sizes="(min-width: 768px) 18rem, 100vw"
            className="object-cover object-center"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Current Goal</h2>
        <p className="mt-4 max-w-2xl">
          My main goal is turning technical ideas into reliable products:
          backend systems with clear ownership, practical ML workflows that can
          be evaluated, and full-stack interfaces that feel intuitive instead of
          noisy.
        </p>
      </section>
      <section className="mt-12">
        
        <h2 className="text-lg font-semibold">Current Focus</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Machine learning algorithms, model evaluation, and reasoning systems.</li>
          <li>AI-integrated architectures and intelligent product workflows.</li>
          <li>Scalable full-stack systems with clean API boundaries and reliable data flow.</li>
          <li>Developer tooling, local automation, and practical abstractions that make daily work faster.</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Experience Highlights</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Co-founded and built an A-Level study platform on Tencent Cloud, reaching roughly 1,000 daily active users.</li>
          <li>At Tencent Music, evaluated 10 speech synthesis models across 20+ experiments and improved vocal consistency by 20%.</li>
          <li>Built a React Native map app with location visualization and optimized trail storage and rendering performance.</li>
          <li>Ran handwriting recognition data experiments to 96% accuracy and deployed a local DeepSeek setup used by 20 researchers.</li>
          <li>Currently building inventory tooling, SOP improvements, and website updates for Mui Scientific.</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">How I Work</h2>
        <p className="mt-4 max-w-2xl">
          My usual loop is to read the docs or papers, build a small prototype,
          test it with measurable results or real daily usage, then tighten the
          system based on what actually breaks. I care about reliability, cost
          performance, clear system behavior, and user experience as products
          move from experiments into real use.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Skills Snapshot</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Languages: Python, Java, C/C++, JavaScript, TypeScript, HTML/CSS.</li>
          <li>Frameworks and tools: FastAPI, Flask, React, React Native, MySQL, Git, WordPress, LaTeX, Node.js.</li>
          <li>Languages spoken: English, Mandarin Chinese, and basic French.</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Outside Engineering</h2>
        <p className="mt-4 max-w-2xl">
          Outside of coding, I like going to the gym, playing tennis, gaming
          with friends, traveling, and exploring new places through food.
        </p>
      </section>

      <section className="about-note-card mt-12 rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold">Small Note</h2>
        <p className="mt-3">
          If you&apos;ve made it this far, try the terminal puzzle in the &gt;_
          section. I built a few different animations into it and had a lot of
          fun making the interaction feel personal.
        </p>
      </section>
    </>
  );
}
