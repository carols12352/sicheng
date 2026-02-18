import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/seo";
import { getAllPostsWithContent } from "@/lib/writing";

type WritingPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export const metadata: Metadata = {
  title: "Writing",
  description: "Technical notes by Sicheng Ouyang on backend systems, practical ML, developer tooling, and project delivery.",
  alternates: {
    canonical: "/writing",
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/writing`,
    title: `Writing | ${SITE_NAME}`,
    siteName: SITE_NAME,
    description: "Technical notes by Sicheng Ouyang on backend systems, practical ML, developer tooling, and project delivery.",
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `Writing | ${SITE_NAME}`,
    description: "Technical notes by Sicheng Ouyang on backend systems, practical ML, developer tooling, and project delivery.",
    images: [SITE_OG_IMAGE],
  },
};

export default async function WritingPage({ searchParams }: WritingPageProps) {
  const resolvedSearchParams = await searchParams;
  const rawQuery = resolvedSearchParams.q;
  const queryValue = Array.isArray(rawQuery) ? rawQuery[0] : rawQuery;
  const query = (queryValue ?? "").trim();
  const posts = await getAllPostsWithContent();
  const normalizedQuery = query.toLowerCase();
  const normalizeForSearch = (text: string) =>
    text
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`[^`]*`/g, " ")
      .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
      .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
      .replace(/[#>*_\-\n\r]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const getSnippet = (content: string, raw: string) => {
    if (!raw) {
      return "";
    }
    const normalized = normalizeForSearch(content);
    const lower = normalized.toLowerCase();
    const index = lower.indexOf(raw);
    if (index < 0) {
      return "";
    }
    const start = Math.max(0, index - 70);
    const end = Math.min(normalized.length, index + raw.length + 90);
    const snippet = normalized.slice(start, end).trim();
    const prefix = start > 0 ? "... " : "";
    const suffix = end < normalized.length ? " ..." : "";
    return `${prefix}${snippet}${suffix}`;
  };

  const highlightText = (text: string, raw: string) => {
    if (!raw) {
      return text;
    }
    const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "ig"));
    return parts.map((part, index) =>
      part.toLowerCase() === raw.toLowerCase() ? (
        <mark key={`${part}-${index}`} className="article-search-hit">
          {part}
        </mark>
      ) : (
        <span key={`${part}-${index}`}>{part}</span>
      ),
    );
  };

  const visiblePosts = normalizedQuery
    ? posts
      .map((post) => {
        const titleMatch = post.meta.title.toLowerCase().includes(normalizedQuery);
        const summaryMatch = post.meta.summary.toLowerCase().includes(normalizedQuery);
        const tagMatch = post.meta.tags.join(" ").toLowerCase().includes(normalizedQuery);
        const snippet = getSnippet(post.content, normalizedQuery);
        const contentMatch = Boolean(snippet);
        const matches = titleMatch || summaryMatch || tagMatch || contentMatch;
        return {
          post,
          snippet: snippet || post.meta.summary,
          matches,
        };
      })
      .filter((item) => item.matches)
    : posts.map((post) => ({ post, snippet: post.meta.summary, matches: true }));

  return (
    <>
      <section>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Writing
        </h1>
        <p className="mt-4 max-w-2xl">
          Notes based on my experiences and reflections about my work, as well as random knowledge I find interesting.
        </p>
        {query ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            <p>
              Search: <span className="font-medium text-gray-700">{query}</span>
            </p>
            <Link href="/writing" className="ui-link ui-underline">
              Clear search
            </Link>
          </div>
        ) : null}
      </section>

      <section className="mt-12">
        {visiblePosts.length === 0 ? (
          <article className="ui-item border-t border-gray-200 pt-4">
            <h2 className="text-lg font-semibold text-gray-900">No results</h2>
            <p className="mt-3 text-gray-600">
              No writing posts matched <span className="font-medium">{query}</span>.
            </p>
          </article>
        ) : (
          <div className="space-y-10">
            {visiblePosts.map((post) => (
              <article key={post.post.meta.slug} className="ui-item border-t border-gray-200 pt-4">
                <h2 className="text-lg font-semibold">
                  <Link
                    href={`/writing/${post.post.meta.slug}`}
                    className="ui-link ui-underline text-gray-900"
                  >
                    {highlightText(post.post.meta.title, normalizedQuery)}
                  </Link>
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                  {post.post.meta.date ? <span>{post.post.meta.date}</span> : null}
                  <span>{post.post.meta.readingTime}</span>
                </div>
                <p className="mt-3">{highlightText(post.snippet, normalizedQuery)}</p>
                {post.post.meta.tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.post.meta.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
