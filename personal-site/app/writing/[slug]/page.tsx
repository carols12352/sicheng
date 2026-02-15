import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { Prose } from "@/components/mdx/prose";
import { SITE_AUTHOR, SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/seo";
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

  const articleUrl = `${SITE_URL}/writing/${slug}`;

  return {
    title: post.meta.title,
    description: post.meta.summary,
    authors: [{ name: SITE_AUTHOR, url: SITE_URL }],
    keywords: post.meta.tags,
    alternates: {
      canonical: `/writing/${slug}`,
    },
    openGraph: {
      type: "article",
      url: articleUrl,
      title: post.meta.title,
      description: post.meta.summary,
      siteName: SITE_NAME,
      publishedTime: post.meta.date || undefined,
      authors: [SITE_AUTHOR],
      tags: post.meta.tags,
      images: [
        {
          url: SITE_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${post.meta.title} cover image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta.title,
      description: post.meta.summary,
      images: [SITE_OG_IMAGE],
    },
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
