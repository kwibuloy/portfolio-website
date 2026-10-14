/**
 * Fixed page backdrop: topographic contour lines with soft gradient shapes
 * drifting behind them. The contours are a tiling SVG used as a CSS mask (see
 * the contour-lines class in globals.css), so their colour follows the theme token.
 */
export function Background() {
  return (
    <div
      aria-hidden
      className="bg-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="bg-glow animate-drift absolute -top-1/4 -right-1/4 size-2/3 rounded-full opacity-60 blur-3xl motion-reduce:animate-none" />
      <div className="bg-glow-deep animate-drift-slow absolute -bottom-1/3 -left-1/4 size-2/3 rounded-full opacity-30 blur-3xl motion-reduce:animate-none" />
      <div className="contour-lines absolute inset-0" />
    </div>
  );
}
