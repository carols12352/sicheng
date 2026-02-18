import type { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { Prose } from "@/components/mdx/prose";
import { ArticleSearchBridge } from "@/components/writing/article-search-bridge";
import { ArticleToc } from "@/components/writing/article-toc";
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
    <article data-writing-article>
      <ArticleToc />
      <ArticleSearchBridge />
      <header className="mx-auto max-w-[42.5rem] pt-12 sm:pt-16">
        <nav aria-label="Breadcrumb" className="mb-5 text-xs text-gray-500">
          <ol className="m-0 flex items-center gap-2 p-0">
            <li>
              <Link href="/" className="ui-link ui-underline">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/writing" className="ui-link ui-underline">
                Writing
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-gray-600">
              {post.meta.title}
            </li>
          </ol>
        </nav>
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          {post.meta.title}
        </h1>
        <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs tracking-wide text-gray-500">
          {post.meta.date ? <span>{post.meta.date}</span> : null}
          <span>{post.meta.readingTime}</span>
        </div>
        {post.meta.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
            {post.meta.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}
        <div className="mt-10 border-b border-gray-200" />
      </header>

      <section className="mt-0">
        <Prose>
          <MDXRemote source={post.content} components={mdxComponents} />
        </Prose>
      </section>
    </article>
  );
}
