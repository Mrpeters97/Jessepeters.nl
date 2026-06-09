"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

export default function Nav() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  const links = [
    { href: "/work", label: "Work" },
    { href: "/about", label: "About" },
    { href: "/archive", label: "Archive" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-10 xl:px-16"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <Link
        href="/"
        className="text-sm font-medium tracking-tight transition-opacity hover:opacity-60"
        style={{ color: "var(--text)" }}
      >
        Jesse Peters
      </Link>

      <nav className="flex items-center gap-6 md:gap-8">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-sm transition-opacity hover:opacity-60"
            style={{
              color: "var(--text)",
              opacity: pathname?.startsWith(href) ? 1 : 0.5,
            }}
          >
            {label}
          </Link>
        ))}

        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="text-sm transition-opacity hover:opacity-60 w-8 h-8 flex items-center justify-center rounded-full"
          style={{
            color: "var(--text)",
            border: "1px solid var(--border)",
          }}
        >
          {theme === "light" ? "○" : "●"}
        </button>
      </nav>
    </header>
  );
}
