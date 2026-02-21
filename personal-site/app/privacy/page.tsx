import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE_NAME}`,
  description: "Privacy Policy for Sicheng Ouyang's website.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <section className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Privacy Policy</h1>
      <p className="mt-3 text-sm text-gray-500">Effective date: February 21, 2026</p>

      <div className="mt-8 space-y-8 leading-7">
        <section>
          <h2 className="text-lg font-semibold">Who We Are</h2>
          <p className="mt-2">
            This website is operated by Sicheng Ouyang. Site URL: <a className="ui-link ui-underline" href={SITE_URL}>{SITE_URL}</a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Data We Collect</h2>
          <p className="mt-2">
            This site may collect limited technical usage data, such as page views, referring pages, browser and device information, approximate
            location at a country/region level, and interaction events.
          </p>
          <p className="mt-2">
            If you contact me by email, I will receive the information you provide in that message.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">How Data Is Used</h2>
          <p className="mt-2">
            Data is used to operate the site, understand content usage trends, improve performance, and respond to direct inquiries.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Third-Party Services</h2>
          <p className="mt-2">
            This website uses third-party services to host, monitor, and analyze performance:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Vercel (hosting, site performance, and platform analytics)</li>
            <li>Google Analytics (traffic and behavior measurement)</li>
            <li>Bing Webmaster Tools (indexing diagnostics and search performance insights)</li>
          </ul>
          <p className="mt-2">
            These providers may process limited technical identifiers and usage metadata according to their own policies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Cookies and Similar Technologies</h2>
          <p className="mt-2">
            Analytics services may use cookies or similar technologies to measure traffic and usage patterns. You can manage cookies through your
            browser settings and delete existing cookies at any time.
          </p>
          <p className="mt-2">
            This site presents a cookie consent banner with <strong>Accept</strong> and <strong>Reject</strong> options. If you choose
            {" "}
            <strong>Reject</strong>, analytics tracking is not loaded on this site. Core site functionality (navigation, reading pages, and search)
            remains available regardless of your choice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Data Retention</h2>
          <p className="mt-2">
            Analytics and server-side logs are retained only as long as reasonably necessary for site operations and troubleshooting.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">International Data Processing</h2>
          <p className="mt-2">
            Because this site uses global infrastructure providers, data may be processed in countries outside your place of residence.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Your Choices</h2>
          <p className="mt-2">
            You may stop using this site at any time. If you have privacy questions or requests related to direct communications, contact:
            {" "}
            <a className="ui-link ui-underline" href="mailto:sicheng.ouyang@uwaterloo.ca">sicheng.ouyang@uwaterloo.ca</a>.
          </p>
          <p className="mt-2">
            You may also use browser-level controls such as cookie settings, do-not-track preferences, tracker blocking, and private browsing.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Children&apos;s Privacy</h2>
          <p className="mt-2">
            This site is not directed to children under 13, and I do not knowingly collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Policy Updates</h2>
          <p className="mt-2">
            This policy may be updated over time. Material changes will be reflected by updating the effective date above.
          </p>
        </section>
      </div>
    </section>
  );
}
