import type { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { getMdxComponents } from "@/components/mdx/mdx-components";
import { Prose } from "@/components/mdx/prose";
import { ArticleSearchBridge } from "@/components/writing/article-search-bridge";
import { ArticleToc } from "@/components/writing/article-toc";
import { buildSeoTitle, SITE_AUTHOR, SITE_NAME, SITE_URL } from "@/lib/seo";
import { getAllPosts, getPostBySlug } from "@/lib/writing";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function buildArticleDescription(summary: string, content: string): string {
  if (summary.trim()) {
    return summary.trim();
  }

  const plain = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_\-\[\]\(\)]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return plain.slice(0, 160) || "Technical article from Sicheng Ouyang.";
}

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
  const articleImageUrl = `${SITE_URL}/writing/${slug}/opengraph-image`;
  const description = buildArticleDescription(post.meta.summary, post.content);
  const seoTitle = buildSeoTitle(post.meta.seoTitle || post.meta.title);
  const published = post.meta.date || undefined;

  return {
    title: seoTitle,
    description,
    authors: [{ name: SITE_AUTHOR, url: SITE_URL }],
    keywords: post.meta.tags,
    alternates: {
      canonical: `/writing/${slug}`,
    },
    openGraph: {
      type: "article",
      url: articleUrl,
      title: seoTitle,
      description,
      siteName: SITE_NAME,
      publishedTime: published,
      modifiedTime: published,
      authors: [SITE_AUTHOR],
      tags: post.meta.tags,
      images: [
        {
          url: articleImageUrl,
          width: 1200,
          height: 630,
          alt: `${post.meta.title} cover image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description,
      images: [articleImageUrl],
    },
  };
}

export default async function WritingArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const articleUrl = `${SITE_URL}/writing/${slug}`;
  const articleImageUrl = `${SITE_URL}/writing/${slug}/opengraph-image`;
  const description = buildArticleDescription(post.meta.summary, post.content);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.meta.title,
    description,
    author: {
      "@type": "Person",
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
    mainEntityOfPage: articleUrl,
    datePublished: post.meta.date || undefined,
    dateModified: post.meta.date || undefined,
    image: [articleImageUrl],
    keywords: post.meta.tags.join(", "),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Writing",
        item: `${SITE_URL}/writing`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.meta.title,
        item: articleUrl,
      },
    ],
  };
  const mdxComponents = getMdxComponents();

  return (
    <article data-writing-article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
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
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkMath],
                rehypePlugins: [rehypeKatex],
              },
            }}
          />
        </Prose>
      </section>
    </article>
  );
}
