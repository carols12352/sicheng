import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Image from "next/image";
import Link from "next/link";
import { PageTransition } from "@/components/motion/page-transition";
import { NavLink } from "@/components/navigation/nav-link";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    locale: "en_CA",
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: "/favicon-dark.ico",
    shortcut: "/favicon-dark.ico",
    apple: "/favicon-dark.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/resume", label: "Resume" },
  { href: "/projects", label: "Projects" },
  { href: "/writing", label: "Writing" },
  { href: "/about", label: "About" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_NAME,
    url: SITE_URL,
    sameAs: [
      "https://github.com/carols12352",
      "https://www.linkedin.com/in/sicheng-ouyang/",
    ],
    alumniOf: "University of Waterloo",
    jobTitle: "Software Engineering Student",
  };

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10 sm:py-12">
          <header>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href="/" className="site-brand ui-link" aria-label="Sicheng Ouyang Home">
                <Image
                  src="/favicon-light.png"
                  alt="Sicheng logo light"
                  width={28}
                  height={28}
                  className="site-logo site-logo-light"
                />
                <Image
                  src="/favicon-dark.png"
                  alt="Sicheng logo dark"
                  width={28}
                  height={28}
                  className="site-logo site-logo-dark"
                />
                <span className="text-sm font-semibold text-gray-900">Sicheng Ouyang</span>
              </Link>
              <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {navItems.map((item) => (
                  <NavLink key={item.href} href={item.href} label={item.label} />
                ))}
              </nav>
              <ThemeToggle />
            </div>
          </header>

          <main className="mt-12 flex-1">
            <PageTransition>{children}</PageTransition>
          </main>

          <footer className="mt-24 border-t border-gray-200 pt-8 pb-2 text-sm text-gray-500">
            <p className="site-brand font-semibold text-gray-900">
              <Image
                src="/favicon-light.png"
                alt="Sicheng logo light"
                width={26}
                height={26}
                className="site-logo site-logo-light"
              />
              <Image
                src="/favicon-dark.png"
                alt="Sicheng logo dark"
                width={26}
                height={26}
                className="site-logo site-logo-dark"
              />
              Sicheng Ouyang
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              <a href="https://github.com/carols12352" target="_blank" rel="noreferrer" className="ui-link ui-underline">
                GitHub
              </a>
              <span className="text-gray-400">·</span>
              <a href="https://www.linkedin.com/in/sicheng-ouyang/" target="_blank" rel="noreferrer" className="ui-link ui-underline">
                LinkedIn
              </a>
              <span className="text-gray-400">·</span>
              <a href="mailto:sicheng.ouyang@uwaterloo.ca" target="_blank" rel="noreferrer" className="ui-link ui-underline">
                Contact
              </a>
              <span className="text-gray-400">·</span>
              <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="ui-link ui-underline">
                Sitemap
              </a>
            </div>

            <p className="mt-5 text-xs text-gray-400">© 2026 All rights reserved.</p>
          </footer>
        </div>
        <SpeedInsights />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd),
          }}
        />
      </body>
    </html>
  );
}
