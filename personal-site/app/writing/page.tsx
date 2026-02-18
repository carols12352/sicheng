import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/seo";
import { getAllPosts } from "@/lib/writing";

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
  const posts = await getAllPosts();
  const normalizedQuery = query.toLowerCase();
  const visiblePosts = normalizedQuery
    ? posts.filter((post) => {
      const haystack = `${post.title} ${post.summary} ${post.tags.join(" ")}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    })
    : posts;

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
          <p className="mt-3 text-sm text-gray-500">
            Search: <span className="font-medium text-gray-700">{query}</span>
          </p>
        ) : null}
      </section>

      <section className="mt-12">
        {visiblePosts.length === 0 ? (
          <article className="ui-item border-t border-gray-200 pt-4">
            <h2 className="text-lg font-semibold text-gray-900">No results</h2>
            <p className="mt-3 text-gray-600">
              No writing posts matched <span className="font-medium">{query}</span>.
            </p>
            <Link href="/writing" className="mt-3 inline-flex ui-link ui-underline text-sm">
              Clear search
            </Link>
          </article>
        ) : (
          <div className="space-y-10">
            {visiblePosts.map((post) => (
              <article key={post.slug} className="ui-item border-t border-gray-200 pt-4">
                <h2 className="text-lg font-semibold">
                  <Link
                    href={`/writing/${post.slug}`}
                    className="ui-link ui-underline text-gray-900"
                  >
                    {post.title}
                  </Link>
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                  {post.date ? <span>{post.date}</span> : null}
                  <span>{post.readingTime}</span>
                </div>
                <p className="mt-3">{post.summary}</p>
                {post.tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
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
