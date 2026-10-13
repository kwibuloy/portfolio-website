import Link from "next/link";
import { NavLinks } from "@/components/sections/sidebar/nav-links";
import { SidebarActions } from "@/components/sections/sidebar/sidebar-actions";
import { Spotlight } from "@/components/sections/sidebar/spotlight";
import { PreferenceToggles } from "@/components/ui/preference-toggles";
import { ScrambleText } from "@/components/ui/scramble-text";
import { site } from "@/content/site";

/** Rendered twice: in the fixed desktop sidebar and inside the mobile drawer. */
export function SidebarContent({ id }: { id: string }) {
  return (
    <Spotlight>
      <div className="flex h-full flex-col gap-8 overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-3">
          <Link
            href="/"
            className="group flex flex-col gap-2 font-mono leading-snug font-medium"
          >
            <ScrambleText text={site.name} onHover duration={600} />
            {/* A line that draws itself under the name on hover. */}
            <span
              aria-hidden
              className="bg-accent h-px w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 motion-reduce:transition-none"
            />
          </Link>
          <PreferenceToggles />
        </div>

        <nav aria-label="Sections">
          <p
            aria-hidden
            className="text-text-subtle px-3 pb-3 font-mono text-xs tracking-widest uppercase"
          >
            Explore
          </p>
          <NavLinks id={id} />
        </nav>

        <SidebarActions />
      </div>
    </Spotlight>
  );
}
