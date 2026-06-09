import Link from "next/link";

export default function Footer() {
  const links = [
    { href: "mailto:hi@jessepeters.nl", label: "hi@jessepeters.nl" },
    {
      href: "https://www.linkedin.com/in/jesse-peters-599219173",
      label: "LinkedIn",
    },
    { href: "https://www.awwwards.com", label: "Awwwards" },
    { href: "https://www.instagram.com/pesse.jeters", label: "Instagram" },
  ];

  return (
    <footer
      className="px-6 py-12 md:px-10 xl:px-16 mt-24"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            Say, hi!
          </p>
          <a
            href="mailto:hi@jessepeters.nl"
            className="text-2xl md:text-3xl font-light transition-opacity hover:opacity-60"
            style={{ color: "var(--text)" }}
          >
            hi@jessepeters.nl
          </a>
        </div>

        <nav className="flex flex-wrap gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-sm transition-opacity hover:opacity-60"
              style={{ color: "var(--text-muted)" }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <p
        className="text-xs mt-12"
        style={{ color: "var(--text-muted)" }}
      >
        © {new Date().getFullYear()} Jesse Peters
      </p>
    </footer>
  );
}
