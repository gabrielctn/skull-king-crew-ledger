import { existsSync, readFileSync } from "node:fs";

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}${detail ? `: ${detail}` : ""}`);
  }
}

const paths = ["web/privacy.html", "web/support.html", "web/legal.css"];
for (const path of paths) check(`${path} exists`, existsSync(path));

const read = (path: string) =>
  existsSync(path) ? readFileSync(path, "utf8") : "";
const privacy = read("web/privacy.html");
const support = read("web/support.html");
const styles = read("web/legal.css");
const build = readFileSync("scripts/build-pwa.mjs", "utf8");
const combined = `${privacy}\n${support}`;

check(
  "both documents expose English sections",
  [privacy, support].every(
    (source) => source.includes('id="english"') && source.includes('lang="en"')
  )
);
check(
  "both documents expose French sections",
  [privacy, support].every(
    (source) => source.includes('id="francais"') && source.includes('lang="fr"')
  )
);
check(
  "both documents expose the support email",
  [privacy, support].every((source) =>
    source.includes("gabrielcretin@gmail.com")
  )
);
check(
  "documents cross-link with relative URLs",
  privacy.includes('href="./support.html"') &&
    support.includes('href="./privacy.html"')
);
check("documents do not execute scripts", !/<script\b/i.test(combined));
check(
  "documents do not embed analytics",
  !/googletagmanager|google-analytics|gtag\s*\(/i.test(combined)
);
check(
  "privacy policy describes processors and data flow",
  /Supabase/.test(privacy) &&
    /Google Analytics/.test(privacy) &&
    /GitHub Pages/.test(privacy)
);
check(
  "privacy policy distinguishes native and web analytics",
  /native iOS app does not run Google Analytics/i.test(privacy) &&
    /version web[^.]*consentement/i.test(privacy)
);
check(
  "privacy policy covers retention and deletion",
  /24 hours/.test(privacy) &&
    /15 minutes/.test(privacy) &&
    /deletion request/i.test(privacy) &&
    /demander[^.]*suppression/i.test(privacy)
);
check(
  "support page warns against sharing credentials",
  /Do not email[^.]*sync codes/i.test(support) &&
    /N’envoyez pas[^.]*codes de synchronisation/i.test(support)
);
check(
  "shared stylesheet has responsive and focus rules",
  /@media \(max-width:/.test(styles) &&
    /:focus-visible/.test(styles) &&
    /prefers-reduced-motion/.test(styles)
);
for (const file of ["privacy.html", "support.html", "legal.css"]) {
  check(
    `build copies ${file}`,
    build.includes(
      `copyFileSync(join(webSrc, "${file}"), join(dist, "${file}"))`
    )
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
