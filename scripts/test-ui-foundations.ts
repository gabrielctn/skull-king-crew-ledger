/**
 * Run with: npm run test:ui-foundations
 */
import {
  backActionForState,
  historyStateForScreen,
  screenFromHistoryState,
} from "../src/navigation";

let failures = 0;

function check(label: string, condition: boolean, detail = ""): void {
  if (condition) {
    console.log(`PASS ${label}`);
    return;
  }
  failures += 1;
  console.error(`FAIL ${label}${detail ? `: ${detail}` : ""}`);
}

check(
  "valid history route restores settings",
  screenFromHistoryState({ skullKingScreen: "settings" }) === "settings"
);
check(
  "invalid history route restores home",
  screenFromHistoryState({ skullKingScreen: "unknown" }) === "home"
);
check(
  "history state preserves existing fields",
  historyStateForScreen({ invite: "kept" }, "stats").invite === "kept"
);
check(
  "history state writes the route",
  historyStateForScreen({}, "stats").skullKingScreen === "stats"
);
check(
  "back closes an open modal before leaving its screen",
  backActionForState({ modalOpen: true, screen: "settings" }) === "close-modal"
);
check(
  "back returns a non-home screen to home",
  backActionForState({ modalOpen: false, screen: "stats" }) === "home"
);
check(
  "back exits from home with no modal",
  backActionForState({ modalOpen: false, screen: "home" }) === "exit"
);

if (failures > 0) process.exit(1);
