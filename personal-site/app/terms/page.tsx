import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Terms of Service | ${SITE_NAME}`,
  description: "Terms of Service for Sicheng Ouyang's website.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsOfServicePage() {
  return (
    <section className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Terms of Service</h1>
      <p className="mt-3 text-sm text-gray-500">Effective date: February 21, 2026</p>

      <div className="mt-8 space-y-8 leading-7">
        <section>
          <h2 className="text-lg font-semibold">Acceptance</h2>
          <p className="mt-2">
            By accessing this website, you agree to these terms. If you do not agree, please do not use the site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Use of Content</h2>
          <p className="mt-2">
            All content on this site is provided for informational purposes. You may reference and share links to content, but you may not copy,
            republish, or commercially exploit materials without permission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Ownership and Copyright</h2>
          <p className="mt-2">
            Unless stated otherwise, content on this website is created and owned by Sicheng Ouyang. All rights are reserved.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Prohibited Use</h2>
          <p className="mt-2">
            You agree not to misuse the site, attempt unauthorized access, interfere with site operations, or use automated methods that create
            unreasonable load.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Third-Party Links</h2>
          <p className="mt-2">
            This site may include links to third-party websites. I am not responsible for their content, availability, privacy practices, or terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">No User-Generated Content</h2>
          <p className="mt-2">
            This website does not currently support public user submissions, user accounts, comments, or user-uploaded content.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">No Warranty</h2>
          <p className="mt-2">
            This website is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Limitation of Liability</h2>
          <p className="mt-2">
            To the fullest extent permitted by law, I am not liable for any direct, indirect, incidental, or consequential damages arising from your
            use of this site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Updates</h2>
          <p className="mt-2">
            These terms may be updated at any time. Continued use of the site after changes means you accept the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="mt-2">
            Questions about these terms can be sent to{" "}
            <a className="ui-link ui-underline" href="mailto:sicheng.ouyang@uwaterloo.ca">sicheng.ouyang@uwaterloo.ca</a>.
          </p>
        </section>
      </div>
    </section>
  );
}
