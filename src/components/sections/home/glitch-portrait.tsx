import Image from "next/image";

/**
 * The portrait, sharp and in colour. On hover (or while pressed on a touch
 * screen) it glitches: horizontal slices jump sideways, red and cyan ghost
 * copies split off, and scan lines flash, then it snaps back clean.
 *
 * It is all CSS (see .glitch in globals.css), so this stays a server
 * component. The two ghosts are background images tinted with a blend mode;
 * they are decorative and hidden from assistive technology.
 */
export function GlitchPortrait({ src, alt }: { src: string; alt: string }) {
  const ghost = { backgroundImage: `url(${src})` };

  return (
    <div className="glitch border-border relative aspect-square w-full max-w-md overflow-hidden rounded-3xl border">
      <Image
        src={src}
        alt={alt}
        fill
        preload
        sizes="(min-width: 768px) 28rem, 100vw"
        className="glitch-base object-cover"
      />
      <div aria-hidden className="glitch-ghost glitch-ghost-a" style={ghost} />
      <div aria-hidden className="glitch-ghost glitch-ghost-b" style={ghost} />
      <div aria-hidden className="glitch-lines" />
    </div>
  );
}
