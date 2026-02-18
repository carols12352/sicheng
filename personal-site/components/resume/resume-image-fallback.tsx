"use client";

import { useState } from "react";

type ResumeImageFallbackProps = {
  pdfPath: string;
};

export function ResumeImageFallback({ pdfPath }: ResumeImageFallbackProps) {
  const [missingImage, setMissingImage] = useState(false);

  if (missingImage) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white px-6 text-center">
        <p className="text-sm text-gray-600">
          Preview image is not available on this deployment.
          {" "}
          <a href={pdfPath} target="_blank" rel="noreferrer" className="ui-link ui-underline">
            Open PDF in new tab
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/resume-preview.jpg"
      alt="Resume preview fallback"
      className="h-full w-full object-contain"
      onError={() => setMissingImage(true)}
    />
  );
}
