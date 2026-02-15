import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume",
  description: "Resume of Sicheng Ouyang, Software Engineering student at the University of Waterloo.",
  alternates: {
    canonical: "/resume",
  },
};

const RESUME_PATH = "/resume_26.2.14.pdf";

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
        <div className="mx-auto aspect-[8.5/11] w-full max-w-4xl overflow-hidden bg-white ring-1 ring-gray-200">
          <object data={RESUME_PATH} type="application/pdf" className="h-full w-full">
            <iframe src={RESUME_PATH} title="Resume Preview" className="h-full w-full" />
          </object>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        If your browser blocks embedded PDFs, use &quot;Open in New Tab&quot;.
      </p>
    </section>
  );
}
