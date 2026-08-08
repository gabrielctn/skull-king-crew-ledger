export type InstallGuidePlatform =
  | "ios_safari"
  | "ios_chrome"
  | "android"
  | "other";

/**
 * Select the shortest useful install guide without reading browser globals.
 * Keeping this pure lets iPad desktop mode remain covered without emulating a
 * browser in the preference tests.
 */
export function detectInstallGuidePlatform(
  userAgent: string,
  platform: string,
  maxTouchPoints: number
): InstallGuidePlatform {
  const ipadDesktopMode = platform === "MacIntel" && maxTouchPoints > 1;
  const iosDevice = /iPad|iPhone|iPod/i.test(userAgent) || ipadDesktopMode;
  if (iosDevice) {
    return /CriOS/i.test(userAgent) ? "ios_chrome" : "ios_safari";
  }
  return /Android/i.test(userAgent) ? "android" : "other";
}

export function normalizeAnalyticsConsent(
  value: unknown
): "accepted" | "declined" | null {
  return value === "accepted" || value === "declined" ? value : null;
}

/** Limit withdrawal to the GA cookies this app may have created. */
export function isGoogleAnalyticsCookieName(name: string): boolean {
  return name === "_ga" || name === "_gid" || name === "_gat" ||
    name.startsWith("_ga_") || name.startsWith("_gat_");
}
