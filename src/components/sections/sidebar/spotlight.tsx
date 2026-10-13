"use client";

/**
 * Wraps the sidebar in a soft light that follows the pointer. The pointer
 * position is written to two CSS variables, and the `.spotlight` class in
 * globals.css paints a radial gradient there, so moving the pointer never
 * re-renders React.
 */
export function Spotlight({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="spotlight h-full"
      onPointerMove={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty(
          "--spot-x",
          `${event.clientX - box.left}px`,
        );
        event.currentTarget.style.setProperty(
          "--spot-y",
          `${event.clientY - box.top}px`,
        );
      }}
    >
      {children}
    </div>
  );
}
