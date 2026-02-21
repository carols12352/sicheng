import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Disclaimer | ${SITE_NAME}`,
  description: "General disclaimer for Sicheng Ouyang's website.",
  alternates: {
    canonical: "/disclaimer",
  },
};

export default function DisclaimerPage() {
  return (
    <section className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Disclaimer</h1>
      <p className="mt-3 text-sm text-gray-500">Effective date: February 21, 2026</p>

      <div className="mt-8 space-y-8 leading-7">
        <section>
          <h2 className="text-lg font-semibold">General Information Only</h2>
          <p className="mt-2">
            Content on this website is provided for general informational and educational purposes only.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">No Professional Advice</h2>
          <p className="mt-2">
            Nothing on this site constitutes legal, financial, medical, tax, or other professional advice. You should consult qualified professionals
            before making decisions based on any information found here.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Accuracy and Completeness</h2>
          <p className="mt-2">
            I make reasonable efforts to keep content accurate, but I do not guarantee that information is complete, current, or error-free.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Technical Content and Code Samples</h2>
          <p className="mt-2">
            Code samples and technical discussions are provided without warranty. Use them at your own risk and validate before production use.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Analytics and Search Tooling</h2>
          <p className="mt-2">
            This site uses analytics and webmaster tooling (including Google Analytics and Bing Webmaster Tools) for traffic insights and indexing
            diagnostics. Metrics are intended for site improvement and do not represent guarantees of search ranking or visibility.
          </p>
          <p className="mt-2">
            If you reject cookie consent, analytics tracking is not loaded, while normal browsing features continue to work.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">External Links</h2>
          <p className="mt-2">
            External websites linked from this site are not under my control. I am not responsible for their content, policies, or reliability.
          </p>
        </section>
      </div>
    </section>
  );
}
