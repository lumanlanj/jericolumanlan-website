import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Timeline" },
  { href: "/writing", label: "Writing" },
  { href: "/log", label: "Log" },
  { href: "/projects", label: "Projects" },
];

const EXTERNAL = [
  {
    href: "https://www.linkedin.com/in/jerico-lumanlan",
    label: "LinkedIn",
    svg: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    href: "https://x.com/jericolumanlan",
    label: "X (Twitter)",
    svg: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    href: "https://jericolumanlan.medium.com",
    label: "Medium",
    svg: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 right-0 z-40 md:right-auto md:z-10 md:h-screen md:w-[190px] bg-cream/80 backdrop-blur-md md:bg-transparent md:backdrop-blur-none px-7 pt-5 md:pt-11 pb-4 md:pb-11 flex md:flex-col gap-0 border-b md:border-b-0 border-(--color-border)">
      <div className="flex flex-col md:mb-9">
        <Link
          href="/"
          className="text-[20px] font-semibold leading-tight tracking-tight text-(--color-ink) no-underline hover:opacity-70 transition"
        >
          Jerico
          <br className="hidden md:inline" />
          <span className="md:hidden"> </span>
          Lumanlan
        </Link>
        <div className="text-[13px] text-(--color-muted) mt-1">Boston-based</div>
      </div>

      <nav className="flex md:flex-col md:flex-1 gap-5 md:gap-2.5 ml-auto md:ml-0 mt-0 md:mt-0 items-center md:items-start">
        {NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-[15px] text-(--color-muted) hover:text-(--color-ink) transition no-underline"
          >
            {l.label}
          </Link>
        ))}
        <div className="flex gap-3.5 md:pt-2 items-center">
          {EXTERNAL.map((e) => (
            <a
              key={e.href}
              href={e.href}
              target="_blank"
              rel="noopener"
              aria-label={e.label}
              className="text-(--color-muted) hover:text-(--color-ink) transition flex items-center"
            >
              {e.svg}
            </a>
          ))}
        </div>
      </nav>
    </aside>
  );
}
