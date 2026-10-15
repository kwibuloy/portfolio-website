"use client";

import { Component, type ReactNode } from "react";

/**
 * Catches a 3D scene that fails while rendering: a WebGL context that cannot
 * be created (hardware acceleration off, a locked-down work machine), or a
 * model or chunk that did not download. A context lost later is an event,
 * not an error, so it is not caught here.
 *
 * React Three Fiber re-throws render errors, and without a boundary they
 * would take the whole page down with them. The parent is told through
 * `onError` and shows its own fallback; the boundary renders nothing.
 *
 * Error boundaries still have to be class components in React 19.
 */
export class SceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
