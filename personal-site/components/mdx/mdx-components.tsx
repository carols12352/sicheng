import Link from "next/link";
import type { ReactElement, ReactNode } from "react";
import { isValidElement } from "react";
import { Callout } from "@/components/mdx/callout";
import { CodeHighlighter } from "@/components/mdx/code-highlighter";
import { CodeBlock } from "@/components/mdx/code-block";
import { Copyright } from "@/components/mdx/copyright";
import { Figure } from "@/components/mdx/figure";
import { Sidenote } from "@/components/mdx/sidenote";
import { TokenPredictionDemo } from "@/components/mdx/token-prediction-demo";
import { ZoomableImage } from "@/components/mdx/zoomable-image";
import { MermaidDiagram } from "@/components/projects/mermaid-diagram";

type HeadingProps = React.ComponentPropsWithoutRef<"h2">;

type AnchorHeadingProps = HeadingProps & {
  as: "h2" | "h3";
  className: string;
};

const BLOCK_HTML_TAGS = new Set([
  "aside",
  "copyright",
  "details",
  "div",
  "figure",
  "section",
  "pre",
  "table",
  "ul",
  "ol",
  "blockquote",
]);

const BLOCK_COMPONENT_NAMES = new Set([
  "Figure",
  "Callout",
  "CodeBlock",
  "Copyright",
  "MermaidDiagram",
  "TokenPredictionDemo",
]);

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function extractText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(extractText).join(" ").trim();
  }

  if (isValidElement(children)) {
    const element = children as ReactElement<{ children?: ReactNode }>;
    return extractText(element.props.children);
  }

  return "";
}

function containsBlockNode(children: ReactNode): boolean {
  if (Array.isArray(children)) {
    return children.some((child) => containsBlockNode(child));
  }

  if (isValidElement(children)) {
    const element = children as ReactElement<{ children?: ReactNode }>;
    const elementType = element.type;

    if (typeof elementType === "string" && BLOCK_HTML_TAGS.has(elementType)) {
      return true;
    }

    if (typeof elementType === "function" && BLOCK_COMPONENT_NAMES.has(elementType.name)) {
      return true;
    }

    return containsBlockNode(element.props.children);
  }

  return false;
}

function getCodeLanguage(className?: string): string {
  if (!className) {
    return "";
  }
  const match = className.match(/(?:language-|lang-)([a-z0-9-]+)/i);
  return match?.[1]?.toLowerCase() ?? "";
}

function inferLanguageFromCode(code: string): string {
  const source = code.trim();
  if (!source) {
    return "";
  }
  if (/^\s*def\s+\w+\(.*\)\s*:/m.test(source) || /\bimport\s+\w+/m.test(source)) {
    return "python";
  }
  if (/^\s*{[\s\S]*}\s*$/.test(source) && /":\s*/.test(source)) {
    return "json";
  }
  if (/\b(const|let|function|=>|import|export)\b/.test(source)) {
    return "ts";
  }
  if (/^\s*(echo|if\s+\[|fi|for\s+\w+\s+in)\b/m.test(source)) {
    return "bash";
  }
  return "";
}

function extractCodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map((item) => extractCodeText(item)).join("");
  }

  if (isValidElement(node)) {
    const element = node as ReactElement<{ children?: ReactNode }>;
    return extractCodeText(element.props.children);
  }

  return "";
}

function findCodeElement(node: ReactNode): ReactElement<{ className?: string; children?: ReactNode }> | null {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findCodeElement(child);
      if (found) {
        return found;
      }
    }
    return null;
  }

  if (isValidElement(node)) {
    const element = node as ReactElement<{ className?: string; children?: ReactNode }>;
    const className = typeof element.props.className === "string" ? element.props.className : "";
    if (/(?:language-|lang-)[a-z0-9-]+/i.test(className)) {
      return element;
    }
    if (typeof element.type === "string" && element.type.toLowerCase() === "code") {
      return element;
    }
    return findCodeElement(element.props.children);
  }

  return null;
}

function AnchorHeading({ as, className, id, children, ...props }: AnchorHeadingProps) {
  const text = extractText(children);
  const headingId = id ?? (text ? slugify(text) : undefined);

  if (as === "h2") {
    return (
      <h2 id={headingId} className={className} {...props}>
        {children}
      </h2>
    );
  }

  return (
    <h3 id={headingId} className={className} {...props}>
      {children}
    </h3>
  );
}

const InternalLink = ({ href, children, ...props }: React.ComponentPropsWithoutRef<"a">) => {
  if (!href) {
    return <a className="underline decoration-gray-400 underline-offset-4" {...props}>{children}</a>;
  }

  if (href.startsWith("/")) {
    return (
      <Link
        href={href}
        className="text-gray-900 underline decoration-gray-400 underline-offset-4 transition-colors hover:decoration-gray-700"
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className="text-gray-900 underline decoration-gray-400 underline-offset-4 transition-colors hover:decoration-gray-700"
      target="_blank"
      rel="noreferrer"
      {...props}
    >
      {children}
    </a>
  );
};

export const mdxComponents = {
  h2: (props: React.ComponentPropsWithoutRef<"h2">) => (
    <AnchorHeading
      as="h2"
      className="mt-12 mb-0 scroll-mt-24 text-[1.7rem] font-semibold tracking-tight text-gray-900 first:mt-0"
      {...props}
    />
  ),
  h3: (props: React.ComponentPropsWithoutRef<"h3">) => (
    <AnchorHeading
      as="h3"
      className="mt-10 mb-0 scroll-mt-24 text-[1.35rem] font-semibold tracking-tight text-gray-900 first:mt-0"
      {...props}
    />
  ),
  p: ({ children, ...props }: React.ComponentPropsWithoutRef<"p">) => {
    if (containsBlockNode(children)) {
      return (
        <div className="leading-[1.9] text-gray-700" {...props}>
          {children}
        </div>
      );
    }

    return (
      <p className="leading-[1.9] text-gray-700" {...props}>
        {children}
      </p>
    );
  },
  ul: (props: React.ComponentPropsWithoutRef<"ul">) => (
    <ul className="mt-3 mb-2 list-disc pl-6 marker:text-gray-500 first:mt-0 [&>li]:m-0 [&>li+li]:mt-3" {...props} />
  ),
  ol: (props: React.ComponentPropsWithoutRef<"ol">) => (
    <ol className="mt-3 mb-2 list-decimal pl-6 marker:text-gray-500 first:mt-0 [&>li]:m-0 [&>li+li]:mt-3" {...props} />
  ),
  li: (props: React.ComponentPropsWithoutRef<"li">) => (
    <li
      className="leading-[1.85] text-gray-700 [&>p]:mt-0 [&>p]:leading-[1.85] [&>ul]:mt-3 [&>ol]:mt-3"
      {...props}
    />
  ),
  a: (props: React.ComponentPropsWithoutRef<"a">) => <InternalLink {...props} />,
  blockquote: (props: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="mt-0 mb-3 border-l-2 border-gray-300 pl-5 text-gray-600 italic [&+p]:mt-2" {...props} />
  ),
  code: ({ className, ...props }: React.ComponentPropsWithoutRef<"code">) => {
    const language = getCodeLanguage(className);
    if (language) {
      return <code className={`${className ?? ""} font-mono text-[0.86rem] text-gray-800`} {...props} />;
    }
    return (
      <code
        className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[0.9em] text-gray-900"
        {...props}
      />
    );
  },
  pre: ({ children, ...props }: React.ComponentPropsWithoutRef<"pre">) => {
    const codeElement = findCodeElement(children);
    const language = codeElement ? getCodeLanguage(codeElement.props.className) : "";
    const rawCode = (codeElement ? extractCodeText(codeElement.props.children) : extractCodeText(children)).replace(/\n$/, "");
    const resolvedLanguage = language || inferLanguageFromCode(rawCode);

    return (
      <figure className="codeblock-frame mt-7 overflow-hidden rounded-md border border-gray-200 bg-gray-50/40">
        {resolvedLanguage ? (
          <figcaption className="codeblock-head border-b border-gray-200 px-3 py-1 text-[10px] uppercase tracking-[0.08em] text-gray-500">
            {resolvedLanguage}
          </figcaption>
        ) : null}
        <pre
          className="codeblock-pre overflow-x-auto px-3.5 py-3 text-[0.84rem] leading-6 text-gray-800"
          {...props}
        >
          <code className="codeblock-code font-mono text-[0.86rem] text-gray-800">
            {rawCode ? <CodeHighlighter code={rawCode} language={resolvedLanguage || "ts"} /> : children}
          </code>
        </pre>
      </figure>
    );
  },
  table: (props: React.ComponentPropsWithoutRef<"table">) => (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props: React.ComponentPropsWithoutRef<"thead">) => (
    <thead className="bg-gray-50" {...props} />
  ),
  th: (props: React.ComponentPropsWithoutRef<"th">) => (
    <th className="border-b border-gray-300 px-3 py-2 text-left font-semibold text-gray-900" {...props} />
  ),
  td: (props: React.ComponentPropsWithoutRef<"td">) => (
    <td className="border-b border-gray-200 px-3 py-2 text-gray-700" {...props} />
  ),
  img: (props: React.ComponentPropsWithoutRef<"img">) => <ZoomableImage {...props} />,
  Callout,
  copyright: Copyright,
  Copyright,
  Figure,
  CodeBlock,
  Sidenote,
  TokenPredictionDemo,
  MermaidDiagram,
};
