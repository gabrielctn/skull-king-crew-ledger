import { useEffect, useState } from "react";

/** The slice of the visual viewport API this module needs. */
interface ViewportMetrics {
  height: number;
  offsetTop: number;
}

/**
 * How much of the layout viewport the on-screen keyboard is covering.
 *
 * Browsers do not shrink the layout viewport when the keyboard opens: they
 * lay the visual viewport over it instead, so anything anchored to the bottom
 * of a full-screen overlay stays pinned underneath the keyboard. The band
 * below the visual viewport is what a bottom sheet has to lift itself by.
 *
 * Focusing a field can also scroll the visual viewport down (`offsetTop`),
 * which hides that much more of the layout viewport at the bottom.
 */
export function keyboardInsetFromViewport(
  layoutHeight: number,
  viewport: ViewportMetrics
): number {
  const covered = layoutHeight - (viewport.height + viewport.offsetTop);
  // Sub-pixel viewport heights and rubber-band scrolling report a permanent
  // inset of a pixel or so, which would only jitter the layout.
  return covered > 1 ? covered : 0;
}

/**
 * Bottom inset that keeps a sheet clear of the on-screen keyboard on the web.
 *
 * Native platforms return 0: there `KeyboardAvoidingView` does the same job
 * from the real keyboard frame, and rides its animation curve while doing it.
 * Pass `enabled` so a closed sheet holds no listeners.
 */
export function useKeyboardInset(enabled: boolean): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport =
      typeof window !== "undefined" ? window.visualViewport : null;
    if (!enabled || !viewport) return;

    const update = () =>
      setInset(keyboardInsetFromViewport(window.innerHeight, viewport));

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      setInset(0);
    };
  }, [enabled]);

  return enabled ? inset : 0;
}
