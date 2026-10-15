import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

// The browser tab icon: the portrait, cropped to a circle. Rendered once at
// build time, like opengraph-image.tsx.

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Read once when the module loads (at build time), not inside the handler.
const portrait = await readFile(join(process.cwd(), "public", site.portrait));
const portraitSrc = `data:image/jpeg;base64,${portrait.toString("base64")}`;

export default function Icon() {
  return new ImageResponse(
    // eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img
    <img
      src={portraitSrc}
      alt=""
      width={size.width}
      height={size.height}
      style={{ borderRadius: "50%", objectFit: "cover" }}
    />,
    size,
  );
}
