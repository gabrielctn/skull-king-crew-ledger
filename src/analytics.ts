import { Platform } from "react-native";
import {
  isGoogleAnalyticsCookieName,
  normalizeAnalyticsConsent,
} from "./preferences";

export { normalizeAnalyticsConsent } from "./preferences";

export const GOOGLE_ANALYTICS_ID = "G-JJ74VCT4C6";

export type AnalyticsConsent = "accepted" | "declined";

const ANALYTICS_CONSENT_KEY = "skullking:analyticsConsent";
const ANALYTICS_SCRIPT_ID = "skullking-google-analytics";
const analyticsConsentListeners = new Set<
  (consent: AnalyticsConsent | null) => void
>();

type AnalyticsWindow = Window & {
  dataLayer?: IArguments[];
  gtag?: (...args: unknown[]) => void;
  [key: `ga-disable-${string}`]: boolean | undefined;
};

function notifyAnalyticsConsent(consent: AnalyticsConsent | null): void {
  analyticsConsentListeners.forEach((listener) => listener(consent));
}

/** Read the visitor's saved choice without touching storage on native builds. */
export function loadAnalyticsConsent(): AnalyticsConsent | null {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;
  try {
    return normalizeAnalyticsConsent(
      window.localStorage.getItem(ANALYTICS_CONSENT_KEY)
    );
  } catch {
    return null;
  }
}

/** Remember the choice when browser storage is available. */
export function saveAnalyticsConsent(consent: AnalyticsConsent): void {
  if (Platform.OS !== "web" || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, consent);
  } catch {
    // Consent still applies to this page view when storage is unavailable.
  }
}

/** Remove the saved choice and show the consent prompt again. */
export function clearAnalyticsConsent(): void {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(ANALYTICS_CONSENT_KEY);
    } catch {
      // The prompt can still return for this page view when storage is blocked.
    }
  }
  disableGoogleAnalytics();
  notifyAnalyticsConsent(null);
}

/** Subscribe settings and the banner to changes made elsewhere in the app. */
export function subscribeAnalyticsConsent(
  listener: (consent: AnalyticsConsent | null) => void
): () => void {
  analyticsConsentListeners.add(listener);
  return () => analyticsConsentListeners.delete(listener);
}

/**
 * Apply a deliberate choice in one place, so a later decline can always undo
 * an earlier acceptance on this device.
 */
export function applyAnalyticsConsent(choice: AnalyticsConsent): void {
  saveAnalyticsConsent(choice);
  if (choice === "accepted") {
    enableGoogleAnalytics();
  } else {
    disableGoogleAnalytics();
  }
  notifyAnalyticsConsent(choice);
}

/** Stop GA on this page and erase its browser state for this host. */
export function disableGoogleAnalytics(): void {
  if (
    Platform.OS !== "web" ||
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    return;
  }

  const analyticsWindow = window as unknown as AnalyticsWindow;
  analyticsWindow[`ga-disable-${GOOGLE_ANALYTICS_ID}`] = true;
  document.getElementById(ANALYTICS_SCRIPT_ID)?.remove();
  delete analyticsWindow.gtag;
  delete analyticsWindow.dataLayer;

  const names = new Set(
    document.cookie
      .split(";")
      .map((cookie) => cookie.trim().split("=", 1)[0])
      .filter(isGoogleAnalyticsCookieName)
  );
  names.add("_ga");
  names.add(`_ga_${GOOGLE_ANALYTICS_ID.replace("G-", "")}`);
  names.add("_gid");
  names.add("_gat");
  const hostname = window.location.hostname;
  const domains = hostname ? ["", `; domain=${hostname}`, `; domain=.${hostname}`] : [""];
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    }
  }
}

/**
 * Load Google Analytics only after explicit consent. The calls mirror Google's
 * standard gtag snippet, while the id makes repeated React effects idempotent.
 */
export function enableGoogleAnalytics(): void {
  if (
    Platform.OS !== "web" ||
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    return;
  }
  if (typeof __DEV__ !== "undefined" && __DEV__) return;

  const analyticsWindow = window as unknown as AnalyticsWindow;
  analyticsWindow[`ga-disable-${GOOGLE_ANALYTICS_ID}`] = false;
  if (document.getElementById(ANALYTICS_SCRIPT_ID)) return;
  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  analyticsWindow.gtag = function gtag(..._args: unknown[]) {
    analyticsWindow.dataLayer?.push(arguments);
  };

  const script = document.createElement("script");
  script.id = ANALYTICS_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;
  script.onerror = () => script.remove();
  document.head.appendChild(script);

  analyticsWindow.gtag("js", new Date());
  analyticsWindow.gtag("config", GOOGLE_ANALYTICS_ID);
}
