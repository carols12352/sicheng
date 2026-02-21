import type { Metadata } from "next";
import { buildSeoTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: buildSeoTitle("Terminal Easter Egg and Command Puzzle"),
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
