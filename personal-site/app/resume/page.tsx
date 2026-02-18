import type { Metadata } from "next";
import { ResumeImageFallback } from "@/components/resume/resume-image-fallback";
import { SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Resume",
  description: "Resume of Sicheng Ouyang, Software Engineering student at the University of Waterloo.",
  alternates: {
    canonical: "/resume",
  },
  openGraph: {
    type: "profile",
    url: `${SITE_URL}/resume`,
    title: `Resume | ${SITE_NAME}`,
    siteName: SITE_NAME,
    description: "Resume of Sicheng Ouyang, Software Engineering student at the University of Waterloo.",
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `Resume | ${SITE_NAME}`,
    description: "Resume of Sicheng Ouyang, Software Engineering student at the University of Waterloo.",
    images: [SITE_OG_IMAGE],
  },
};

const RESUME_PATH = "/resume_26.2.15.pdf";

export default function ResumePage() {
  return (
    <section className="mx-auto max-w-5xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            Resume
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Live preview and download
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={RESUME_PATH}
            target="_blank"
            rel="noreferrer"
            className="ui-link inline-block rounded border border-gray-200 px-3 py-1.5 text-sm"
          >
            Open in New Tab
          </a>
          <a
            href={RESUME_PATH}
            download
            className="ui-link inline-block rounded border border-gray-200 px-3 py-1.5 text-sm"
          >
            Download PDF
          </a>
        </div>
      </header>

      <div className="mt-6 border border-gray-200 bg-gray-50 p-3 sm:p-5">
        <div className="mb-4 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
          Compatibility mode: some browsers/extensions (forced dark mode, PDF plugins) may render embedded PDF as blank or too dark.
          If that happens, use <span className="font-medium text-gray-700">Open in New Tab</span> or the fallback image below.
        </div>
        <div className="mx-auto aspect-[8.5/11] w-full max-w-4xl overflow-hidden bg-white ring-1 ring-gray-200">
          <object data={RESUME_PATH} type="application/pdf" className="h-full w-full">
            <iframe src={RESUME_PATH} title="Resume Preview" className="h-full w-full">
              <ResumeImageFallback pdfPath={RESUME_PATH} />
            </iframe>
            <ResumeImageFallback pdfPath={RESUME_PATH} />
          </object>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        If your browser blocks embedded PDFs, use &quot;Open in New Tab&quot;.
      </p>
    </section>
  );
}
