import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PageTransition } from "@/components/motion/page-transition";
import { NavLink } from "@/components/navigation/nav-link";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sicheng Ouyang",
    template: "%s | Sicheng Ouyang",
  },
  description: "Personal website for Sicheng Ouyang",
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
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10 sm:py-12">
          <header>
            <div className="flex flex-wrap items-center justify-between gap-3">
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
            <p className="font-semibold text-gray-900">Sicheng Ouyang</p>

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
            </div>

            <p className="mt-5 text-xs text-gray-400">© 2026 All rights reserved.</p>
          </footer>
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}
