import { AccessibilityInfo, Platform } from "react-native";
import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";
let nativePreference: boolean | undefined;

export interface ReducedMotionState {
  reducedMotion: boolean;
  known: boolean;
}

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
export function useReducedMotionState(): ReducedMotionState {
  const web = Platform.OS === "web";
  const [reducedMotion, setReducedMotion] = useState(() =>
    web ? readWebReducedMotion() : nativePreference ?? true
  );
  const [known, setKnown] = useState(() => web || nativePreference !== undefined);

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
      setKnown(true);
      if (typeof query.addEventListener === "function") {
        query.addEventListener("change", update);
        return () => query.removeEventListener("change", update);
      }
      query.addListener(update);
      return () => query.removeListener(update);
    }

    let active = true;
    const updateNativePreference = (enabled: boolean) => {
      nativePreference = enabled;
      if (!active) return;
      setReducedMotion(enabled);
      setKnown(true);
    };
    void AccessibilityInfo.isReduceMotionEnabled()
      .then(updateNativePreference)
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      updateNativePreference
    );
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return { reducedMotion, known };
}

/** Public boolean convenience hook for components that only need the preference. */
export function useReducedMotion(): boolean {
  return useReducedMotionState().reducedMotion;
}
