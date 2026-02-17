import Link from "next/link";
import type { ReactElement, ReactNode } from "react";
import { isValidElement } from "react";
import { Callout } from "@/components/mdx/callout";
import { CodeBlock } from "@/components/mdx/code-block";
import { Figure } from "@/components/mdx/figure";

type HeadingProps = React.ComponentPropsWithoutRef<"h2">;

type AnchorHeadingProps = HeadingProps & {
  as: "h2" | "h3";
  className: string;
};

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
  p: (props: React.ComponentPropsWithoutRef<"p">) => (
    <p className="leading-[1.9] text-gray-700" {...props} />
  ),
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
    <blockquote className="mt-8 border-l-2 border-gray-300 pl-5 text-gray-600 italic" {...props} />
  ),
  code: (props: React.ComponentPropsWithoutRef<"code">) => (
    <code
      className="rounded border border-gray-200 px-1.5 py-0.5 font-mono text-[0.9em] text-gray-900"
      {...props}
    />
  ),
  pre: (props: React.ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="mt-8 overflow-x-auto border border-gray-200 bg-gray-50 p-5 text-sm leading-6 text-gray-800"
      {...props}
    />
  ),
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
  img: (props: React.ComponentPropsWithoutRef<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="mx-auto mt-8 w-full rounded-md border border-gray-200" {...props} alt={props.alt ?? ""} />
  ),
  Callout,
  Figure,
  CodeBlock,
};
