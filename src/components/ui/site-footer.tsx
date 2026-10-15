import { site, socials } from "@/content/site";

/** The page footer, under every page's content. */
export function SiteFooter() {
  return (
    <footer className="max-w-content text-text-subtle mx-auto flex w-full flex-wrap items-center justify-between gap-4 px-6 pb-24 font-mono text-xs lg:px-12">
      <p>Designed and built by {site.name}.</p>
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {socials.map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="hover:text-text transition-colors"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
