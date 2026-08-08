export type ScreenTransitionAction = "animate" | "snap" | "visible";

/**
 * An entrance belongs only to a route that mounted after motion was known to
 * be allowed. Preference changes may settle the current route, never replay it.
 */
export function screenTransitionAction({
  entryEligible,
  hasAnimated,
  reducedMotion,
}: {
  entryEligible: boolean;
  hasAnimated: boolean;
  reducedMotion: boolean;
}): ScreenTransitionAction {
  if (reducedMotion) return "snap";
  if (!entryEligible || hasAnimated) return "visible";
  return "animate";
}
