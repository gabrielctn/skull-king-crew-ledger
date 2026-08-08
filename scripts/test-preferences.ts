import {
  detectInstallGuidePlatform,
  isGoogleAnalyticsCookieName,
  normalizeAnalyticsConsent,
} from "../src/preferences";

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}`);
  }
}

check(
  "iPhone Safari receives the Safari install guide",
  detectInstallGuidePlatform(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    "iPhone",
    0
  ) === "ios_safari"
);
check(
  "iPhone Chrome receives the Chrome install guide",
  detectInstallGuidePlatform(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.6422.152 Mobile/15E148 Safari/604.1",
    "iPhone",
    0
  ) === "ios_chrome"
);
check(
  "Android Chrome receives the Android install guide",
  detectInstallGuidePlatform(
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
    "Linux armv8l",
    0
  ) === "android"
);
check(
  "iPad desktop mode keeps the Safari install guide",
  detectInstallGuidePlatform(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    "MacIntel",
    5
  ) === "ios_safari"
);
check(
  "desktop browsers do not receive a phone-specific guide",
  detectInstallGuidePlatform(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "MacIntel",
    0
  ) === "other"
);

check("accepted consent stays accepted", normalizeAnalyticsConsent("accepted") === "accepted");
check("declined consent stays declined", normalizeAnalyticsConsent("declined") === "declined");
check("empty consent stays undecided", normalizeAnalyticsConsent(null) === null);
check("garbage consent becomes undecided", normalizeAnalyticsConsent("maybe") === null);

check("the base GA cookie is cleared", isGoogleAnalyticsCookieName("_ga"));
check("GA measurement cookies are cleared", isGoogleAnalyticsCookieName("_ga_JJ74VCT4C6"));
check("the GA session cookie is cleared", isGoogleAnalyticsCookieName("_gid"));
check("the GA throttle cookie is cleared", isGoogleAnalyticsCookieName("_gat"));
check("named GA throttle cookies are cleared", isGoogleAnalyticsCookieName("_gat_gtag_UA_123"));
check("unrelated cookies are retained", !isGoogleAnalyticsCookieName("session"));
check("non-GA Google cookies are retained", !isGoogleAnalyticsCookieName("_gcl_au"));

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed === 0 ? 0 : 1;
