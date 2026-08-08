/**
 * Run with: npm run test:ui-foundations
 */
import { readFileSync } from "node:fs";
import {
  backActionForState,
  historyStateForScreen,
  restoredHistoryRoute,
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

const cookieConsentSource = readFileSync(
  "src/components/CookieConsentBanner.tsx",
  "utf8"
);
const transitionSource = readFileSync(
  "src/components/ScreenTransition.tsx",
  "utf8"
);
const reducedMotionSource = readFileSync("src/useReducedMotion.ts", "utf8");

check(
  "accepted analytics initialization is evaluated before Reduce Motion",
  cookieConsentSource.indexOf('if (consent === "accepted")') <
    cookieConsentSource.indexOf("if (reducedMotion)")
);
check(
  "screen transitions reset in a layout effect and stop during cleanup",
  transitionSource.includes("useLayoutEffect") &&
    transitionSource.includes("return () => animation.stop()")
);
check(
  "native motion stays conservative until its accessibility preference is known",
  reducedMotionSource.includes("known") && reducedMotionSource.includes("true")
);

const priorFinishedGame = { id: "finished-game", status: "finished" as const };
const rematchGame = { id: "rematch-game", status: "in_progress" as const };
const historyGames = [priorFinishedGame, rematchGame];
const resultsState = historyStateForScreen(
  { invite: "kept" },
  "results",
  priorFinishedGame.id
);
const rematchState = historyStateForScreen({}, "game", rematchGame.id);

const restoredResults = restoredHistoryRoute(resultsState, historyGames);
check(
  "Results to New game browser Back restores the finished result",
  restoredResults.screen === "results" &&
    restoredResults.gameId === priorFinishedGame.id
);
check(
  "Results to Rematch browser Back restores the earlier finished game",
  restoredHistoryRoute(resultsState, historyGames).gameId === priorFinishedGame.id
);
check(
  "Results to Rematch browser Forward restores the rematch game",
  restoredHistoryRoute(rematchState, historyGames).screen === "game" &&
    restoredHistoryRoute(rematchState, historyGames).gameId === rematchGame.id
);
check(
  "a stateful route without its game safely returns Home",
  restoredHistoryRoute(
    historyStateForScreen({}, "results", "deleted-game"),
    historyGames
  ).screen === "home"
);

if (failures > 0) process.exit(1);
