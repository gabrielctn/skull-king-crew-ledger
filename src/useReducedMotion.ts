import { AccessibilityInfo, Platform } from "react-native";
import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

export function readWebReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  try {
    return window.matchMedia(QUERY).matches;
  } catch {
    return false;
  }
}

/** Tracks the platform accessibility setting and updates while the app is open. */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(readWebReducedMotion);

  useEffect(() => {
    if (Platform.OS === "web") {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return;
      }

      let query: MediaQueryList;
      try {
        query = window.matchMedia(QUERY);
      } catch {
        return;
      }
      const update = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
      setReducedMotion(query.matches);
      if (typeof query.addEventListener === "function") {
        query.addEventListener("change", update);
        return () => query.removeEventListener("change", update);
      }
      query.addListener(update);
      return () => query.removeListener(update);
    }

    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReducedMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReducedMotion
    );
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reducedMotion;
}
