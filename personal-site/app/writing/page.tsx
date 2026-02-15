import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/writing";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Technical notes by Sicheng Ouyang on backend systems, practical ML, developer tooling, and project delivery.",
  alternates: {
    canonical: "/writing",
  },
};

export default async function WritingPage() {
  const posts = await getAllPosts();

  return (
    <>
      <section>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Writing
        </h1>
        <p className="mt-4 max-w-2xl">
          Notes based on my experiences and reflections about my work, as well as random knowledge I find interesting.
        </p>
      </section>

      <section className="mt-12">
        <div className="space-y-10">
          {posts.map((post) => (
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
      </section>
    </>
  );
}
