/** How far in from the leading edge a back swipe may start, in points. */
export const BACK_SWIPE_EDGE_WIDTH = 28;
/** Travel past this share of the width commits the gesture on release. */
const COMMIT_FRACTION = 0.32;
/** A flick this fast commits it too, however short. */
const COMMIT_VELOCITY = 0.5;
/** Below this the movement is a tap or a scroll, not a swipe. */
const SLOP = 8;
/** Horizontal travel has to beat vertical by this much to be a back swipe. */
const DIRECTION_BIAS = 1.5;

export interface BackSwipeGesture {
  /** Where the finger went down, from the left of the screen. */
  x0: number;
  /** Travel since, positive to the right. */
  dx: number;
  dy: number;
  /** Current speed, positive to the right. */
  vx: number;
  width: number;
  /** Arabic reads the other way, so its back gesture does too. */
  rtl: boolean;
}

/** Travel towards the leading edge, whichever side of the screen that is. */
function leadingTravel({ dx, rtl }: Pick<BackSwipeGesture, "dx" | "rtl">) {
  return rtl ? -dx : dx;
}

/**
 * True when a movement is a back swipe rather than a tap or a scroll: it began
 * within the edge strip, has travelled far enough to mean it, and is going
 * more sideways than up.
 */
export function isBackSwipe({
  x0,
  dx,
  dy,
  width,
  rtl,
}: Omit<BackSwipeGesture, "vx">): boolean {
  const fromEdge = rtl
    ? x0 >= width - BACK_SWIPE_EDGE_WIDTH
    : x0 <= BACK_SWIPE_EDGE_WIDTH;
  return (
    fromEdge &&
    leadingTravel({ dx, rtl }) > SLOP &&
    Math.abs(dx) > Math.abs(dy) * DIRECTION_BIAS
  );
}

/**
 * How far the screen has followed the finger, signed for the writing direction
 * and never past either end: a back swipe cannot drag a screen backwards.
 */
export function backSwipeTravel({
  dx,
  width,
  rtl,
}: Pick<BackSwipeGesture, "dx" | "width" | "rtl">): number {
  const travel = Math.max(0, Math.min(leadingTravel({ dx, rtl }), width));
  return rtl ? -travel : travel;
}

/**
 * True when letting go here should complete the back navigation: either the
 * screen is far enough across, or it was thrown hard enough to get there.
 */
export function backSwipeCommits({
  dx,
  vx,
  width,
  rtl,
}: Omit<BackSwipeGesture, "x0" | "dy">): boolean {
  return (
    leadingTravel({ dx, rtl }) > width * COMMIT_FRACTION ||
    leadingTravel({ dx: vx, rtl }) > COMMIT_VELOCITY
  );
}
