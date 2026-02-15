import type { ReactNode } from "react";

type CodeBlockProps = {
  filename?: string;
  language?: string;
  children: ReactNode;
};

export function CodeBlock({ filename, language, children }: CodeBlockProps) {
  return (
    <figure className="mt-6 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
      {filename ? (
        <figcaption className="border-b border-gray-200 px-3 py-2 text-xs text-gray-500">
          {filename}
          {language ? ` (${language})` : ""}
        </figcaption>
      ) : null}
      <pre className="overflow-x-auto p-4 text-sm leading-6 text-gray-800">
        <code className="font-mono">{children}</code>
      </pre>
    </figure>
  );
}
