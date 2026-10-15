"use client";

import { Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { useSyncExternalStore } from "react";
import { toggleSound } from "@/lib/preferences";
import { switchTheme } from "@/lib/theme-transition";

const segmentClass =
  "relative flex size-8 items-center justify-center rounded-full transition-colors";
const iconMotion =
  "size-4 transition-transform duration-500 ease-out motion-reduce:transition-none";

// The theme lives on <html data-theme>, set before React hydrates. Reading it
// through useSyncExternalStore keeps aria-pressed in step with it without a
// hydration mismatch: the server renders no pressed state, and the client
// fills it in right after hydrating.
// The sound setting on <html data-sound> is read the same way.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-sound"],
  });
  return () => observer.disconnect();
}
const readTheme = () => document.documentElement.dataset.theme;
const readSound = () => document.documentElement.dataset.sound;
const onServer = () => undefined;

/**
 * Light and dark as two joined buttons with a pill that slides to the one in
 * use, and the sound toggle beside them. The visuals (pill position, icon
 * spin, colours) follow data-theme / data-sound through the dark: and
 * sound-on: variants, so they are right from the first paint.
 */
export function PreferenceToggles() {
  const theme = useSyncExternalStore(subscribe, readTheme, onServer);
  const sound = useSyncExternalStore(subscribe, readSound, onServer);

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <div
        role="group"
        aria-label="Theme"
        className="border-border relative flex items-center rounded-full border p-0.5"
      >
        {/* The pill: under Sun in light, slid under Moon in dark. */}
        <span
          aria-hidden
          className="bg-raised absolute top-0.5 left-0.5 size-8 rounded-full shadow-sm transition-transform duration-300 ease-out motion-reduce:transition-none dark:translate-x-full"
        />
        <button
          type="button"
          aria-label="Light theme"
          aria-pressed={theme === undefined ? undefined : theme === "light"}
          onClick={(event) => switchTheme(event.currentTarget, "light")}
          className={`${segmentClass} text-text dark:text-text-muted dark:hover:text-text`}
        >
          {/* Spins and shrinks away when it is not the one in use. */}
          <Sun
            aria-hidden
            className={`${iconMotion} dark:scale-75 dark:-rotate-90`}
          />
        </button>
        <button
          type="button"
          aria-label="Dark theme"
          aria-pressed={theme === undefined ? undefined : theme === "dark"}
          onClick={(event) => switchTheme(event.currentTarget, "dark")}
          className={`${segmentClass} text-text-muted hover:text-text dark:text-text`}
        >
          <Moon
            aria-hidden
            className={`${iconMotion} scale-75 rotate-90 dark:scale-100 dark:rotate-0`}
          />
        </button>
      </div>

      <button
        type="button"
        onClick={toggleSound}
        className="border-border text-text-muted hover:bg-raised hover:text-text flex size-9 items-center justify-center rounded-full border transition-colors"
        aria-label="Interface sounds"
        aria-pressed={sound === undefined ? undefined : sound === "on"}
      >
        <VolumeX aria-hidden className="sound-on:hidden size-4" />
        <Volume2 aria-hidden className="sound-on:block hidden size-4" />
      </button>
    </div>
  );
}
