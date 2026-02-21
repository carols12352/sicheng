import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terminal",
  description: "Interactive terminal easter egg.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  alternates: {
    canonical: "/terminal",
  },
};

export default function TerminalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
