import Link from "next/link";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/#work", label: "Work" },
  { href: "/#writing", label: "Writing" },
  { href: "/#about", label: "About" },
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

export default function TopNav() {
  return (
    <header className="fixed top-[max(1rem,env(safe-area-inset-top))] inset-x-0 z-50 flex justify-center px-[max(1rem,env(safe-area-inset-left),env(safe-area-inset-right))]">
      <nav
        className="flex items-center gap-1 rounded-full
                   bg-white/[0.07] backdrop-blur-xl
                   border border-white/[0.12]
                   shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                   px-2 py-1.5"
      >
        {NAV.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="px-3.5 sm:px-4 py-2 sm:py-1.5 rounded-full text-[13px] sm:text-[14px]
                       text-(--color-muted) hover:text-(--color-ink) hover:bg-white/[0.08]
                       transition no-underline"
          >
            {l.label}
          </Link>
        ))}

        <span className="hidden sm:block mx-1.5 h-4 w-px bg-white/[0.14]" aria-hidden="true" />

        <div className="hidden sm:flex items-center gap-1 pr-1">
          {EXTERNAL.map((e) => (
            <a
              key={e.href}
              href={e.href}
              target="_blank"
              rel="noopener"
              aria-label={e.label}
              className="p-2 rounded-full text-(--color-muted) hover:text-(--color-ink)
                         hover:bg-white/[0.08] transition flex items-center"
            >
              {e.svg}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
