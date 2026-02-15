"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  label: string;
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname();
  const active = isActive(pathname, href);

  return (
    <Link
      href={href}
      className={`ui-nav-link relative pb-1 ${active ? "ui-nav-link-active text-black" : "text-gray-600"}`}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}
