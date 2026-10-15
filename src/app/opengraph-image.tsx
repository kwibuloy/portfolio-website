import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

// The link preview shown when the site is shared (LinkedIn, Slack, Discord,
// iMessage). Rendered once at build time. Next adds it to every page, since
// it sits at the root of the app.

export const alt = `${site.name}, ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The image renderer cannot read CSS variables, so the light theme's tokens
// from globals.css are repeated here: --bg, --text, --text-muted, --border.
const colors = {
  bg: "#ffffff",
  text: "#111111",
  muted: "#4d4d4d",
  border: "#e2e2e2",
};

// Read once when the module loads (at build time), as in the Next.js docs.
// Reading it inside the handler counts as uncached I/O, which would make the
// image render again on every request.
const portrait = await readFile(join(process.cwd(), "public", site.portrait));
const portraitSrc = `data:image/jpeg;base64,${portrait.toString("base64")}`;

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 64,
        padding: 80,
        background: colors.bg,
        color: colors.text,
        borderBottom: `16px solid ${colors.text}`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- the image renderer only understands <img> */}
      <img
        src={portraitSrc}
        alt=""
        width={320}
        height={320}
        style={{
          flexShrink: 0,
          borderRadius: 9999,
          border: `8px solid ${colors.border}`,
          objectFit: "cover",
        }}
      />
      {/* flex: 1 and minWidth 0 let the long name wrap instead of running
          off the edge. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.05,
          }}
        >
          {site.name}
        </div>
        <div style={{ fontSize: 34, color: colors.muted, lineHeight: 1.3 }}>
          {site.role}
        </div>
        <div style={{ fontSize: 26, color: colors.muted }}>
          {`github.com/${site.github}`}
        </div>
      </div>
    </div>,
    size,
  );
}
