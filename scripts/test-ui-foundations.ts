/**
 * Run with: npm run test:ui-foundations
 */
import { readFileSync } from "node:fs";
import {
  backActionForState,
  historyDeltaToHome,
  historyDepthFromState,
  historyStateForModal,
  historyStateForScreen,
  isAppHistoryState,
  isModalHistoryState,
  restoredHistoryRoute,
  screenFromHistoryState,
} from "../src/navigation";
import { screenTransitionAction } from "../src/screenTransitionPolicy";
import {
  BACK_SWIPE_EDGE_WIDTH,
  backSwipeCommits,
  backSwipeTravel,
  isBackSwipe,
} from "../src/backSwipePolicy";
import { focusPlayerInput } from "../src/playerInputFocus";
import { STATS_ICON_META } from "../src/statsIcons";

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
  "screen history clears modal state and records an explicit depth",
  historyStateForScreen(
    { skullKingModal: true, skullKingDepth: 2 },
    "settings",
    undefined,
    3
  ).skullKingModal === undefined &&
    historyDepthFromState(
      historyStateForScreen({}, "settings", undefined, 3)
    ) === 3
);
check(
  "modal history preserves its route and depth",
  isModalHistoryState(
    historyStateForModal({ skullKingScreen: "settings", skullKingDepth: 2 })
  ) &&
    screenFromHistoryState(
      historyStateForModal({ skullKingScreen: "settings", skullKingDepth: 2 })
    ) === "settings" &&
    historyDepthFromState(
      historyStateForModal({ skullKingScreen: "settings", skullKingDepth: 2 })
    ) === 2
);
check(
  "invalid history depths are treated as the root entry",
  historyDepthFromState({ skullKingDepth: -1 }) === 0 &&
    historyDepthFromState({ skullKingDepth: 1.5 }) === 0
);
check(
  "reload only recognizes complete app history entries",
  isAppHistoryState({ skullKingScreen: "settings", skullKingDepth: 1 }) &&
    !isAppHistoryState({ skullKingScreen: "settings" }) &&
    !isAppHistoryState({ skullKingScreen: "unknown", skullKingDepth: 1 })
);
check(
  "in-app Back returns through existing history instead of pushing Home",
  historyDeltaToHome({ skullKingDepth: 3 }) === -3 &&
    historyDeltaToHome({ skullKingDepth: 0 }) === 0
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
check(
  "stats icons use stable glyph metadata instead of emoji chrome",
  STATS_ICON_META.bestFinalScore.name === "crown" &&
    STATS_ICON_META.totalGames.name === "calendar-blank" &&
    STATS_ICON_META.empty.name === "map-outline"
);

const cookieConsentSource = readFileSync(
  "src/components/CookieConsentBanner.tsx",
  "utf8"
);
const reducedMotionSource = readFileSync("src/useReducedMotion.ts", "utf8");
const statsSource = readFileSync("src/screens/StatsScreen.tsx", "utf8");
const appIconSource = readFileSync("src/components/AppIcon.tsx", "utf8");
const spectatorSource = readFileSync("src/screens/SpectatorScreen.tsx", "utf8");
const liveShareSource = readFileSync("src/components/ShareLiveModal.tsx", "utf8");
const scoreChartSource = readFileSync("src/components/ScoreChart.tsx", "utf8");
const settingsSource = readFileSync("src/screens/SettingsScreen.tsx", "utf8");
const appSource = readFileSync("App.tsx", "utf8");
const appConfig = readFileSync("app.json", "utf8");
const manifest = readFileSync("web/manifest.webmanifest", "utf8");
const screenTransitionSource = readFileSync(
  "src/components/ScreenTransition.tsx",
  "utf8"
);

check(
  "accepted analytics initialization is evaluated before Reduce Motion",
  cookieConsentSource.indexOf('if (consent === "accepted")') <
    cookieConsentSource.indexOf("if (reducedMotion)")
);
check(
  "cross-screen accessibility contracts cover headings, targets, live recovery, and orientation",
  statsSource.includes("STATS_ICON_META") &&
    statsSource.includes('accessibilityRole="header"') &&
    spectatorSource.includes("retryAttempt") &&
    spectatorSource.includes("t.spectator.retry") &&
    spectatorSource.includes("t.spectator.changeIdentity") &&
    liveShareSource.includes("copyTextToClipboard") &&
    liveShareSource.includes("Share.share") &&
    liveShareSource.includes("accessibilityState={{ busy: starting") &&
    settingsSource.includes('accessibilityLiveRegion="polite"') &&
    appSource.includes('accessibilityRole="progressbar"') &&
    appConfig.includes('"orientation": "default"') &&
    appConfig.includes('"orientation": "any"') &&
    manifest.includes('"orientation": "any"')
);
check(
  "decorative AppIcon glyphs are hidden from the web accessibility tree too",
  appIconSource.includes("aria-hidden={accessibilityHidden}")
);
check(
  "loading states expose one explicit progress owner and hide duplicate children",
  appSource.includes('<Text style={styles.loaderText} accessible={false} aria-hidden>') &&
    spectatorSource.includes('accessible\n            accessibilityRole="progressbar"') &&
    spectatorSource.includes('<Text style={styles.connectingText} accessible={false} aria-hidden>')
);
check(
  "decorative loading children are hidden from native and web accessibility trees",
  /ActivityIndicator[\s\S]{0,160}accessible=\{false\}[\s\S]{0,160}aria-hidden/.test(
    appSource
  ) &&
    /ActivityIndicator[\s\S]{0,160}accessible=\{false\}[\s\S]{0,160}aria-hidden/.test(
      spectatorSource
    ) &&
    /ActivityIndicator[\s\S]{0,160}accessible=\{false\}[\s\S]{0,160}aria-hidden/.test(
      liveShareSource
    ) &&
    appSource.includes('style={styles.loaderText} accessible={false} aria-hidden') &&
    spectatorSource.includes('style={styles.connectingText} accessible={false} aria-hidden')
);
check(
  "Stats restores focus with native accessibility focus and web DOM focus",
  statsSource.includes("findNodeHandle") &&
    statsSource.includes("AccessibilityInfo.setAccessibilityFocus") &&
    statsSource.includes('Platform.OS === "web"')
);
check(
  "Live Share labels its live-session title as a heading",
  liveShareSource.includes('style={styles.liveOnTitle} accessibilityRole="header"')
);
check(
  "web chart legend summaries use a supported labelled group",
  scoreChartSource.includes('role="group"') &&
    scoreChartSource.includes("aria-label={summaries[playerIndex]?.label}")
);
check(
  "web radio and busy semantics use direct ARIA state attributes",
  spectatorSource.includes("aria-checked={active}") &&
    liveShareSource.includes("aria-busy={starting}")
);
check(
  "web screen transitions do not request the unsupported native animation driver",
  screenTransitionSource.includes("useNativeDriver: Platform.OS !== \"web\"")
);
check(
  "browser history owns modal Back and returns Home without pushing a duplicate route",
  appSource.includes("historyStateForModal(window.history.state)") &&
    appSource.includes("isModalHistoryState(event.state)") &&
    appSource.includes("window.history.go(historyDelta)") &&
    !appSource.includes('const handleHome = () => navigate("home")')
);
check(
  "reload restores a marked app entry instead of rewriting a second Home root",
  appSource.includes("if (isAppHistoryState(window.history.state))") &&
    appSource.includes("restoreHistoryState(window.history.state)")
);
check(
  "the global storage warning stays inside the native bottom safe area",
  appSource.includes(
    '<SafeAreaView style={styles.storageWarningSafeArea} pointerEvents="box-none">'
  ) &&
    appSource.includes("storageWarningSafeArea: {") &&
    appSource.includes("...StyleSheet.absoluteFillObject")
);
check(
  "native motion stays conservative until its accessibility preference is known",
  reducedMotionSource.includes("known") && reducedMotionSource.includes("true")
);
check(
  "unknown to allowed keeps the already-visible native route still",
  screenTransitionAction({
    entryEligible: false,
    hasAnimated: false,
    reducedMotion: false,
  }) === "visible"
);
check(
  "reduced to allowed keeps the current route still",
  screenTransitionAction({
    entryEligible: false,
    hasAnimated: false,
    reducedMotion: false,
  }) === "visible"
);
check(
  "known allowed route mount gets one entrance animation",
  screenTransitionAction({
    entryEligible: true,
    hasAnimated: false,
    reducedMotion: false,
  }) === "animate"
);
check(
  "allowed to reduced snaps an entering route and never replays it",
  screenTransitionAction({
    entryEligible: true,
    hasAnimated: true,
    reducedMotion: true,
  }) === "snap" &&
    screenTransitionAction({
      entryEligible: true,
      hasAnimated: true,
      reducedMotion: false,
    }) === "visible"
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

// --- setup input focus -----------------------------------------------------

let focusedPlayerId: string | null = null;
let inputFocusCount = 0;
const playerInputFocused = focusPlayerInput(
  "p3",
  {
    p3: {
      focus() {
        inputFocusCount += 1;
      },
    },
  },
  (id) => {
    focusedPlayerId = id;
  }
);

check(
  "pending player focus activates the mounted input and focused-player state",
  playerInputFocused && focusedPlayerId === "p3" && inputFocusCount === 1
);
check(
  "pending player focus is harmless when the input did not mount",
  !focusPlayerInput("missing", {}, () => {
    throw new Error("missing inputs must not update focus state");
  })
);

// --- back swipe ------------------------------------------------------------

const swipe = (over: Partial<Parameters<typeof isBackSwipe>[0]> = {}) => ({
  x0: 4,
  dx: 40,
  dy: 2,
  width: 390,
  rtl: false,
  ...over,
});

check(
  "a drag from the leading edge is a back swipe",
  isBackSwipe(swipe())
);
check(
  "a drag starting past the edge strip is left to the screen",
  !isBackSwipe(swipe({ x0: BACK_SWIPE_EDGE_WIDTH + 1 }))
);
check(
  "a scroll is not a back swipe, however far it travels",
  !isBackSwipe(swipe({ dx: 12, dy: 60 }))
);
check(
  "a tap at the edge is not a back swipe",
  !isBackSwipe(swipe({ dx: 3 }))
);
check(
  "dragging away from the leading edge is not a back swipe",
  !isBackSwipe(swipe({ dx: -40 }))
);
check(
  "Arabic swipes back from the right edge, not the left",
  isBackSwipe(swipe({ x0: 388, dx: -40, rtl: true })) &&
    !isBackSwipe(swipe({ x0: 4, dx: 40, rtl: true }))
);

check(
  "the screen follows the finger",
  backSwipeTravel({ dx: 120, width: 390, rtl: false }) === 120
);
check(
  "the screen never follows past its own width, or backwards",
  backSwipeTravel({ dx: 900, width: 390, rtl: false }) === 390 &&
    backSwipeTravel({ dx: -50, width: 390, rtl: false }) === 0
);
check(
  "Arabic follows the finger the other way",
  backSwipeTravel({ dx: -120, width: 390, rtl: true }) === -120 &&
    backSwipeTravel({ dx: 120, width: 390, rtl: true }) === 0
);

check(
  "letting go a third of the way across goes back",
  backSwipeCommits({ dx: 140, vx: 0, width: 390, rtl: false })
);
check(
  "letting go short of that springs back",
  !backSwipeCommits({ dx: 60, vx: 0, width: 390, rtl: false })
);
check(
  "a short flick still goes back",
  backSwipeCommits({ dx: 60, vx: 1.2, width: 390, rtl: false })
);
check(
  "a flick back towards the edge never commits",
  !backSwipeCommits({ dx: 60, vx: -1.2, width: 390, rtl: false })
);
check(
  "Arabic commits on the mirrored travel and flick",
  backSwipeCommits({ dx: -140, vx: 0, width: 390, rtl: true }) &&
    !backSwipeCommits({ dx: 140, vx: 0, width: 390, rtl: true })
);

if (failures > 0) process.exit(1);
