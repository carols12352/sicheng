import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteFrame } from "@/components/site/site-frame";
import { Analytics } from "@vercel/analytics/next"
import {
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_LOCALE,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/seo";
import "katex/dist/katex.min.css";
import "./globals.css";

const THEME_INIT_SCRIPT = `
(() => {
  try {
    const storageKey = "site-theme-mode";
    const saved = window.localStorage.getItem(storageKey);
    const mode = saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
    const motionSaved = window.localStorage.getItem("site-motion-mode");
    const reduceMotionLegacy = window.localStorage.getItem("site-reduce-motion") === "true";
    const motion = motionSaved === "none" || motionSaved === "reduced" || motionSaved === "full"
      ? motionSaved
      : (reduceMotionLegacy ? "reduced" : "full");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = mode === "system" ? (systemDark ? "dark" : "light") : mode;
    const root = document.documentElement;
    root.dataset.theme = mode;
    root.dataset.motion = motion;
    root.dataset.reduceMotion = motion === "none" ? "true" : "false";
    root.style.colorScheme = resolved;
  } catch {}
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_AUTHOR, url: SITE_URL }],
  creator: SITE_AUTHOR,
  publisher: SITE_AUTHOR,
  category: "technology",
  referrer: "origin-when-cross-origin",
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
  bookmarks: [SITE_URL, `${SITE_URL}/projects`, `${SITE_URL}/writing`],
  archives: [`${SITE_URL}/resume`],
  assets: [SITE_OG_IMAGE, `${SITE_URL}/resume_26.2.15.pdf`],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    images: [
      {
        url: SITE_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} portfolio cover`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
  icons: {
    shortcut: [{ url: "/favicon.ico" }],
    apple: [{ url: "/favicon-256x256.png", sizes: "256x256", type: "image/png" }],
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-256x256.png", sizes: "256x256", type: "image/png" },
    ],
  },
  other: {
    "theme-color": "#ffffff",
    "color-scheme": "light dark",
    "msapplication-TileColor": "#111111",
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
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en-CA",
    author: {
      "@type": "Person",
      name: SITE_AUTHOR,
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_INIT_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased">
        <SiteFrame>{children}</SiteFrame>
        <SpeedInsights />
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
      </body>
    </html>
  );
}
