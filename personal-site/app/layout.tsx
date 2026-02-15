import type { Metadata } from "next";
import Link from "next/link";
import { PageTransition } from "@/components/motion/page-transition";
import { NavLink } from "@/components/navigation/nav-link";
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
      <body className="bg-white text-gray-700 antialiased">
        <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10 sm:py-12">
          <header>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {navItems.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} />
              ))}
            </nav>
          </header>

          <main className="mt-12 flex-1">
            <PageTransition>{children}</PageTransition>
          </main>

          <footer className="mt-20 border-t border-gray-200 pt-10 pb-2 text-sm text-gray-500">
            <p className="font-semibold text-gray-800">Sicheng Ouyang</p>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/resume" className="ui-link">
                Resume
              </Link>
              <Link href="/projects" className="ui-link">
                Projects
              </Link>
              <Link href="/writing" className="ui-link">
                Writing
              </Link>
              <Link href="/about" className="ui-link">
                About
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              <a href="https://github.com/carols12352" target="_blank" rel="noreferrer" className="ui-link">
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/sicheng-ouyang/" target="_blank" rel="noreferrer" className="ui-link">
                LinkedIn
              </a>
              <a href="mailto:ouyangsicheng577+work@gmail.com" target="_blank" rel="noreferrer" className="ui-link">
                Contact
              </a>
            </div>

            <div className="mt-6 text-xs text-gray-400">
              © {new Date().getFullYear()} All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
