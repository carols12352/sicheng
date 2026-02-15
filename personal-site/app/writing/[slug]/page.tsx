import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { Prose } from "@/components/mdx/prose";
import { getAllPosts, getPostBySlug } from "@/lib/writing";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Writing" };
  }

  return {
    title: post.meta.title,
    description: post.meta.summary,
  };
}

export default async function WritingArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article>
      <header className="mx-auto max-w-[44rem] pt-10 sm:pt-14">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          {post.meta.title}
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs tracking-wide text-gray-500">
          {post.meta.date ? <span>{post.meta.date}</span> : null}
          <span>{post.meta.readingTime}</span>
        </div>
        {post.meta.tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
            {post.meta.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}
        <div className="mt-8 border-b border-gray-200" />
      </header>

      <section className="mt-14">
        <Prose>
          <MDXRemote source={post.content} components={mdxComponents} />
        </Prose>
      </section>
    </article>
  );
}
