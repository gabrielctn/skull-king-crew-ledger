/**
 * Run with: npm run test:home-layout
 */
import {
  HOME_ACTIONS_HEIGHT,
  HOME_ACTIONS_TOP,
  homeHeroSize,
  homeTopInset,
} from "../src/homeLayout";

let failures = 0;

function check(label: string, condition: boolean, detail = ""): void {
  if (condition) {
    console.log(`PASS ${label}`);
    return;
  }
  failures += 1;
  console.error(`FAIL ${label}${detail ? `: ${detail}` : ""}`);
}

check("home actions have a stable 52px overlay height", HOME_ACTIONS_HEIGHT === 52);
check("home actions have a stable top offset", HOME_ACTIONS_TOP === 16);

const webInset = homeTopInset({ isWeb: true, hasContent: true });
const nativeInset = homeTopInset({ isWeb: false, hasContent: true });
check(
  "web and native content clear the same action overlay",
  webInset === nativeInset,
  `web=${webInset} native=${nativeInset}`
);
check(
  "the action inset includes eight pixels of breathing room",
  webInset >= 60,
  `inset=${webInset}`
);

for (const isWeb of [true, false]) {
  for (const hasContent of [true, false]) {
    const inset = homeTopInset({ isWeb, hasContent });
    check(
      `${isWeb ? "web" : "native"} ${hasContent ? "returning" : "first-use"} content clears the absolute action overlay`,
      inset >= HOME_ACTIONS_TOP + HOME_ACTIONS_HEIGHT + 8,
      `inset=${inset}`
    );
  }
}

const firstUsePhone = homeHeroSize({ isDesktop: false, hasContent: false });
const returningPhone = homeHeroSize({ isDesktop: false, hasContent: true });
check(
  "returning phones receive the compact emblem",
  firstUsePhone.emblem === 188 && returningPhone.emblem === 142,
  `first=${firstUsePhone.emblem} returning=${returningPhone.emblem}`
);
check(
  "compact hero keeps its illustrated seal proportional",
  returningPhone.skull === 112 && returningPhone.height === 132,
  `skull=${returningPhone.skull} height=${returningPhone.height}`
);

const desktopHero = homeHeroSize({ isDesktop: true, hasContent: true });
check(
  "desktop hero remains bounded",
  desktopHero.emblem === 216 && desktopHero.skull === 165 && desktopHero.height === 204,
  `emblem=${desktopHero.emblem} skull=${desktopHero.skull} height=${desktopHero.height}`
);

if (failures > 0) process.exit(1);
