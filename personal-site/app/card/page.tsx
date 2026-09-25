import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { FlipCard } from "./flip-card";
import styles from "./card.module.css";

export const viewport: Viewport = {
  themeColor: "#e6e9ee",
  colorScheme: "light",
  viewportFit: "cover",
};

export const metadata: Metadata = buildPageMetadata({
  title: "Sicheng Ouyang — Digital card",
  description: "Software Engineering at the University of Waterloo. Connect with Sicheng, save his contact, and explore his work.",
  path: "/card",
});

export default function CardPage() {
  return <main className={styles.page}>
    <h1 className={styles.srOnly}>Sicheng Ouyang — digital business card</h1>
    <FlipCard />
    <noscript><p className={styles.noScript}>Sicheng Ouyang · Software Engineering at Waterloo<br /><a href="/card/contact.vcf" download>Save contact</a> · <Link href="/">Visit my website</Link></p></noscript>
  </main>;
}
