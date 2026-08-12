import { readFileSync } from "node:fs";
import { ar } from "../src/i18n/ar";
import { de } from "../src/i18n/de";
import { en } from "../src/i18n/en";
import { es } from "../src/i18n/es";
import { fr } from "../src/i18n/fr";
import { zh } from "../src/i18n/zh";
import { CURRENT_RELEASE } from "../src/releases";
import { keyboardInsetFromViewport } from "../src/keyboardInset";
import {
  formatInviteCode,
  formatInviteCodeInput,
  normalizeInviteCode,
} from "../src/tableInvites";

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

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const packageLock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const appConfig = JSON.parse(readFileSync("app.json", "utf8")).expo;
const xcodeCloudSource = readFileSync(
  "ios/ci_scripts/ci_post_clone.sh",
  "utf8"
);
const cookieSource = readFileSync(
  "src/components/CookieConsentBanner.tsx",
  "utf8"
);
const glassSource = readFileSync("src/components/GlassSurface.tsx", "utf8");
const clipboardWebSource = readFileSync("src/clipboard.ts", "utf8");
const clipboardNativeSource = readFileSync("src/clipboard.native.ts", "utf8");
const copyButtonSource = readFileSync("src/components/CopyButton.tsx", "utf8");
const stepperSource = readFileSync("src/components/Stepper.tsx", "utf8");
const setupSource = readFileSync("src/screens/SetupScreen.tsx", "utf8");
const homeSource = readFileSync("src/screens/HomeScreen.tsx", "utf8");
const appSource = readFileSync("App.tsx", "utf8");
const gameSource = readFileSync("src/screens/GameScreen.tsx", "utf8");
const resultsSource = readFileSync("src/screens/ResultsScreen.tsx", "utf8");
const scoreBreakdownSource = readFileSync(
  "src/components/ScoreBreakdownModal.tsx",
  "utf8"
);
const podiumSource = readFileSync("src/components/Podium.tsx", "utf8");
const supportModalSource = readFileSync(
  "src/components/SupportModal.tsx",
  "utf8"
);
const chartSource = readFileSync("src/components/ScoreChart.tsx", "utf8");
const ltrViewSource = readFileSync("src/components/LtrView.tsx", "utf8");
const lootTrackerSource = readFileSync("src/components/LootTracker.tsx", "utf8");
const rulesSource = readFileSync("src/components/RulesModal.tsx", "utf8");
const bonusEditorSource = readFileSync("src/components/BonusEditor.tsx", "utf8");
const i18nContextSource = readFileSync("src/i18n/context.tsx", "utf8");
const directionProviderSource = readFileSync(
  "src/i18n/DirectionProvider.tsx",
  "utf8"
);
const localeModule: Record<string, unknown> = require("react-native-web/dist/modules/useLocale");
const gameRulesSource = readFileSync(
  "src/components/GameRulesModal.tsx",
  "utf8"
);
const settingsSource = readFileSync("src/screens/SettingsScreen.tsx", "utf8");
const statsSource = readFileSync("src/screens/StatsScreen.tsx", "utf8");
const tableInviteSource = readFileSync(
  "src/components/TableInviteModal.tsx",
  "utf8"
);
const joinByCodeSource = readFileSync(
  "src/components/JoinByCodeModal.tsx",
  "utf8"
);
const cloudSyncSource = readFileSync("src/cloudSync.ts", "utf8");
const whatsNewSource = readFileSync("src/components/WhatsNewModal.tsx", "utf8");
const spectatorSource = readFileSync("src/screens/SpectatorScreen.tsx", "utf8");
const liveShareSource = readFileSync("src/components/ShareLiveModal.tsx", "utf8");
const installSource = readFileSync("src/components/InstallAppSection.tsx", "utf8");
const analyticsSource = readFileSync("src/components/AnalyticsPreferences.tsx", "utf8");
const joinTableModalSource = readFileSync("src/components/JoinTableModal.tsx", "utf8");
const lootConfirmationSource = readFileSync("src/components/LootConfirmationModal.tsx", "utf8");
const playerFacingTextSources = [
  "src/i18n/en.ts",
  "src/i18n/fr.ts",
  "src/i18n/es.ts",
  "src/i18n/de.ts",
  "src/i18n/ar.ts",
  "src/i18n/zh.ts",
  "app.json",
  "web/manifest.webmanifest",
].map((path) => readFileSync(path, "utf8"));

check(
  "release versions stay aligned",
  [packageJson.version, packageLock.version, packageLock.packages[""].version, appConfig.version]
    .every((version) => version === CURRENT_RELEASE)
);
check(
  "the local iOS build number is a positive integer",
  /^[1-9]\d*$/.test(appConfig.ios.buildNumber)
);
const prebuildIndex = xcodeCloudSource.indexOf("npx expo prebuild --platform ios");
const scriptsBackupIndex = xcodeCloudSource.indexOf("cp -Rp ios/ci_scripts");
const scriptsRestoreIndex = xcodeCloudSource.indexOf(
  'cp -Rp "$scripts_backup/ci_scripts" ios/'
);
check(
  "Xcode Cloud stamps its unique build number before generating iOS",
  xcodeCloudSource.includes("CI_BUILD_NUMBER") &&
    xcodeCloudSource.indexOf("CI_BUILD_NUMBER") < prebuildIndex
);
check(
  "Xcode Cloud keeps its own scripts across the prebuild that clears ios/",
  scriptsBackupIndex > -1 &&
    scriptsBackupIndex < prebuildIndex &&
    scriptsRestoreIndex > prebuildIndex
);
check(
  "consent prompt participates in page layout",
  !cookieSource.includes('position: "absolute"')
);
check(
  "glass is reserved for navigation and temporary overlays",
  packageJson.dependencies?.["expo-blur"] &&
    homeSource.includes("<GlassSurface") &&
    setupSource.includes("<GlassSurface") &&
    gameSource.includes("<GlassSurface") &&
    settingsSource.includes("<GlassSurface") &&
    statsSource.includes("<GlassSurface") &&
    cookieSource.includes("<GlassSurface")
);
check(
  "glass preserves contrast and avoids experimental Android blur",
  glassSource.includes("isReduceTransparencyEnabled") &&
    glassSource.includes('Platform.OS === "android"') &&
    glassSource.includes('"systemUltraThinMaterialDark"') &&
    !glassSource.includes("experimentalBlurMethod")
);
check(
  "settings and statistics glass headers overlay scrolling content",
  settingsSource.includes("stickyHeaderIndices={[0]}") &&
    settingsSource.includes("styles.headerLayer") &&
    settingsSource.includes('width: "100%"') &&
    settingsSource.includes("{ paddingTop: layout.screenPadding }") &&
    statsSource.includes("stickyHeaderIndices={[0]}") &&
    statsSource.includes("styles.headerLayer") &&
    statsSource.includes("{ paddingTop: layout.screenPadding }")
);
check(
  "screen headers align with their content columns",
  setupSource.includes("layout.formMaxWidth - layout.screenPadding * 2") &&
    settingsSource.includes("stickyHeaderIndices={[0]}") &&
    statsSource.includes("stickyHeaderIndices={[0]}") &&
    gameSource.includes("layout.gameContentMaxWidth - layout.screenPadding * 2")
);
check(
  "invite copy actions use the cross-platform clipboard with feedback",
  packageJson.dependencies?.["expo-clipboard"] &&
    tableInviteSource.includes('from "../clipboard"') &&
    tableInviteSource.includes("copyTextToClipboard") &&
    tableInviteSource.includes("<CopyButton") &&
    copyButtonSource.includes('"button"') &&
    copyButtonSource.includes("onClick: onPress") &&
    clipboardNativeSource.includes("Clipboard.setStringAsync") &&
    clipboardWebSource.includes("navigator.clipboard.writeText") &&
    clipboardWebSource.includes('document.execCommand("copy")') &&
    tableInviteSource.includes("setCodeCopied(copied)") &&
    tableInviteSource.includes("t.tableInvite.codeCopied")
);
check(
  "active game is excluded from recent history",
  homeSource.includes("historyGame.id !== activeGame.id")
);
check(
  "active game summary shows progress, activity and every player",
  homeSource.includes("t.home.playersRound(") &&
    homeSource.includes("t.home.lastPlayed(") &&
    homeSource.includes("activeGame.players.map((player)")
);
check(
  "active game can be abandoned after a dedicated confirmation",
  homeSource.includes('intent: "abandon"') &&
    homeSource.includes("t.home.abandonMessage") &&
    appSource.includes("const nextCurrent = current?.id === gameId ? null : current")
);
check(
  "quick setup exposes an active-rule summary",
  setupSource.includes("const activeRules = [") &&
    setupSource.includes("styles.ruleChips")
);
check(
  "two-player ghost control is outside advanced customization",
  setupSource.indexOf("{isTwoPlayer ? (") <
    setupSource.indexOf("{customizationVisible ? (")
);
check(
  "stepper supports context-rich accessible labels",
  stepperSource.includes("accessibilityLabel?: string") &&
    stepperSource.includes("accessibilityLabel ?? label")
);
check(
  "untouched round score no longer appears just because the round is valid",
  !gameSource.includes("alreadyRecorded || roundReady || entryTouched") &&
    gameSource.includes("t.game.roundPointsPreview")
);
check(
  "collapsed bonus editors expose recorded counts",
  gameSource.includes("bonusCount(entry.bonus)") &&
    gameSource.includes("styles.bonusBadge")
);
check(
  "bonus control keeps a compact-screen gap when its count is visible",
  gameSource.includes("steppers: {") &&
    gameSource.includes("columnGap: spacing.xs") &&
    gameSource.includes("bonusToggle: {") &&
    gameSource.includes("paddingHorizontal: spacing.xs")
);
check(
  "player-facing text contains no en or em dashes",
  !/[–—]/u.test(
    [
      ...playerFacingTextSources,
      gameSource,
      scoreBreakdownSource,
    ].join("\n")
  )
);
check(
  "desktop round validation keeps its action outside the score sheet",
  !gameSource.includes("styles.footerDesktop")
);
const gameScrollStart = gameSource.indexOf("<ScrollView");
const gameScrollEnd = gameSource.indexOf("</ScrollView>", gameScrollStart);
const scoreButtonInsideScroll = gameSource.indexOf("{scoreButton}", gameScrollStart);
const scoreButtonAfterScroll = gameSource.indexOf("{scoreButton}", gameScrollEnd);
check(
  "round guidance and scoring stay outside the scroll sheet at every width",
  scoreButtonInsideScroll > gameScrollEnd && scoreButtonAfterScroll > gameScrollEnd
);
check(
  "round guidance announces repeat activations on every platform",
  gameSource.includes("AccessibilityInfo.announceForAccessibility") &&
    gameSource.includes('Platform.OS === "ios"') &&
    gameSource.includes("roundIssueAnnouncementCount")
);
check(
  "Setup only vibrates when a valid game is about to start",
  setupSource.includes("if (!canStart) return;") &&
    setupSource.includes("impactHaptic();")
);
check(
  "blocked setup Start labels name the real blocker only for too few players",
  setupSource.includes(
    "named.length < 2 ? t.setup.needPlayers : t.setup.start"
  )
);
check(
  "results have one primary next action",
  resultsSource.includes("style={styles.reviewBtn}") &&
    resultsSource.includes("style={styles.secondaryBtn}")
);
const finishHandler = appSource.slice(
  appSource.indexOf("const handleFinish = "),
  appSource.indexOf("const handleHome = ")
);
check(
  "only a game that just ended raises the support ask",
  finishHandler.includes("void considerSupportPrompt();") &&
    (appSource.match(/considerSupportPrompt\(\)/g) ?? []).length === 1
);
check(
  "the support ask is throttled rather than shown after every game",
  appSource.includes("registerFinishedGame(") &&
    appSource.includes("shouldShowSupportPrompt(") &&
    appSource.includes("markSupportPromptShown(")
);
check(
  "the support ask waits for the celebration and stays on the results screen",
  appSource.includes("PROMPT_DELAY_MS") &&
    appSource.includes('if (screen !== "results")')
);
check(
  "the quiet period starts when the ask appears, not when it is scheduled",
  // An ask dropped because the results screen closed first was never made,
  // so it must not spend the thirty days of silence that follow one.
  (appSource.match(/markSupportPromptShown\(/g) ?? []).length === 1 &&
    appSource.indexOf("markSupportPromptShown(") >
      appSource.indexOf("setSupportPromptVisible(true)")
);
check(
  "the decorative cup stays out of the modal's reading order",
  supportModalSource.includes('<AppIcon name="coffee"')
);
check(
  "prominent game chrome uses vector icons instead of platform emoji",
  !/[☠🏁☕]/u.test(playerFacingTextSources.join("\n")) &&
    !/[☠⚙📡]/u.test(setupSource + gameSource) &&
    !/[🥇🥈🥉]/u.test(resultsSource + podiumSource) &&
    !/[⚓]/u.test(
      joinTableModalSource + lootTrackerSource + lootConfirmationSource
    )
);
check(
  "results keep numeric ranks centered independently from icon ranks",
  resultsSource.includes("style={styles.rankNumber}") &&
    resultsSource.includes("rankNumber:")
);
for (const [language, strings] of Object.entries({ en, fr, es, de, ar, zh })) {
  check(
    `${language} support donation label does not repeat a coffee emoji`,
    !/☕/u.test(strings.supportPrompt.donate)
  );
}
check(
  "the support ask offers a way out that sticks",
  supportModalSource.includes("t.supportPrompt.later") &&
    supportModalSource.includes("t.supportPrompt.never") &&
    appSource.includes("onNever={() => answerSupportPrompt(false)}") &&
    appSource.includes("markSupportPromptAnswered(")
);
check(
  "the support ask states what the App Store listing costs",
  supportModalSource.includes("t.supportPrompt.cost(APP_STORE_ANNUAL_COST_EUR)")
);
check(
  "new expansion is on by default for new games",
  /const \[newExpansion, setNewExpansion\] = useState\(true\)/.test(setupSource)
);
check(
  "bonus editor groups count rows before toggle rows",
  bonusEditorSource.indexOf("t.bonus.pirateBySkullKing") <
    bonusEditorSource.indexOf("t.bonus.black14") &&
    bonusEditorSource.indexOf("t.bonus.black14") <
      bonusEditorSource.indexOf("t.bonus.mermaidCapturesSkullKing")
);
check(
  "game header exposes a labeled Live pill that reflects the session state",
  gameSource.includes("t.liveShare.badge") &&
    gameSource.includes("styles.livePillActive") &&
    gameSource.includes("liveSessionManager")
);
check(
  "turn order names the leader and numbers the seats",
  gameSource.includes("t.game.playOrderLead(") &&
    gameSource.includes("styles.turnChipNum") &&
    spectatorSource.includes("t.game.playOrderLead(") &&
    spectatorSource.includes("styles.turnChipNum")
);
check(
  "game rules can be edited mid-game through the header modal",
  gameSource.includes("GameRulesModal") &&
    gameSource.includes("t.gameSettings.open")
);
check(
  "mid-game rule edits clear Rascal declarations outside Rascal scoring",
  gameRulesSource.includes('next.scoringMode === "rascal" && next.rascalBets')
);
check(
  "the app consumes table join links behind an explicit confirmation",
  appSource.includes("consumeScannedJoinCode") &&
    appSource.includes("JoinTableModal")
);
check(
  "the host hands out a short code a guest can type into their own app",
  tableInviteSource.includes("cloudBackupManager().createInvite()") &&
    tableInviteSource.includes("formatInviteCode(invite.code)") &&
    tableInviteSource.includes("t.tableInvite.expiresIn(") &&
    tableInviteSource.includes("t.tableInvite.newCode")
);
check(
  "the launch dialog shows this release only, Settings keeps the trail",
  whatsNewSource.includes("showHistory") &&
    settingsSource.includes("showHistory") &&
    !homeSource.includes("showHistory") &&
    whatsNewSource.includes("PAST_RELEASES.map")
);
check(
  "the invite sheet offers the code and nothing else",
  !tableInviteSource.includes("qrCodeDataUrl") &&
    !tableInviteSource.includes("buildJoinUrl") &&
    tableInviteSource.includes("t.tableInvite.copyCode")
);
check(
  "join links are still understood, just never handed out",
  !cloudSyncSource.includes("export function buildJoinUrl") &&
    cloudSyncSource.includes("export function extractJoinCode") &&
    appSource.includes("consumeScannedJoinCode")
);
check(
  "the guest sheet resolves a code without joining anything by itself",
  joinByCodeSource.includes("classifyJoinInput(draft)") &&
    joinByCodeSource.includes("cloudBackupManager().redeemInvite(") &&
    joinByCodeSource.includes("onResolved(") &&
    appSource.includes("setPendingJoinCode(code)")
);
check(
  "join-by-code opens on its code field and hides its dismissal backdrop from web AT",
  joinByCodeSource.includes("autoFocus={visible}") &&
    joinByCodeSource.includes("accessible={false}") &&
    joinByCodeSource.includes("aria-hidden")
);
check(
  "the join placeholder shows a code the way the host displays it",
  [en, fr, es, de, ar, zh].every((locale) => {
    const shown = locale.joinByCode.placeholder;
    const code = normalizeInviteCode(shown);
    return code !== null && formatInviteCode(code) === shown;
  })
);
check(
  "the separator is typed for the player, once a group is complete",
  formatInviteCodeInput("K7M4") === "K7M-4" &&
    formatInviteCodeInput("K7M4QP") === "K7M-4QP"
);
check(
  "a complete group holds no trailing separator, so it can be deleted",
  formatInviteCodeInput("K7M") === "K7M" && formatInviteCodeInput("") === ""
);
check(
  "typing lower case or a look-alike still lands on the real code",
  formatInviteCodeInput("k7m4qp") === "K7M-4QP" &&
    formatInviteCodeInput("KIM0") === "K1M-0"
);
check(
  "a code pasted with its separator is left as it already reads",
  formatInviteCodeInput("K7M-4QP") === "K7M-4QP" &&
    formatInviteCodeInput("K7M 4QP") === "K7M-4QP"
);
check(
  "a pasted table code or join link is never regrouped as an invite code",
  formatInviteCodeInput("SKC1.eyJhIjoxfQ") === null &&
    formatInviteCodeInput("https://example.com/app#join=SKC1.eyJhIjoxfQ") ===
      null
);
check(
  "the join field passes through whatever the formatter declines to touch",
  joinByCodeSource.includes("formatInviteCodeInput(value) ?? value")
);
check(
  "the join sheet lifts clear of the keyboard on both platforms",
  joinByCodeSource.includes("<KeyboardAvoidingView") &&
    joinByCodeSource.includes(
      'behavior={Platform.OS === "ios" ? "padding" : undefined}'
    ) &&
    joinByCodeSource.includes("useKeyboardInset(visible)") &&
    joinByCodeSource.includes("paddingBottom: keyboardInset")
);
check(
  "an open keyboard is measured as the band it hides below the visual viewport",
  keyboardInsetFromViewport(844, { height: 508, offsetTop: 0 }) === 336
);
check(
  "a viewport scrolled by the focused field still clears the whole keyboard",
  keyboardInsetFromViewport(844, { height: 508, offsetTop: 40 }) === 296
);
check(
  "a closed keyboard leaves the sheet on the bottom edge",
  keyboardInsetFromViewport(844, { height: 844, offsetTop: 0 }) === 0 &&
    keyboardInsetFromViewport(844, { height: 843.5, offsetTop: 0 }) === 0
);
check(
  "a visual viewport taller than the layout never pads the sheet negatively",
  keyboardInsetFromViewport(844, { height: 900, offsetTop: 0 }) === 0
);
check(
  "the tablet sheet keeps its bottom padding once the keyboard closes",
  joinByCodeSource.includes(
    "paddingBottom: keyboardInset + (layout.isTablet ? spacing.lg : 0)"
  ) && joinByCodeSource.includes("keyboardInset > 0 &&")
);
check(
  "join busy buttons own web busy state without duplicate progress indicators",
  joinByCodeSource.includes("aria-busy={busy}") &&
    /ActivityIndicator[\s\S]{0,120}accessible=\{false\}[\s\S]{0,120}aria-hidden/.test(
      joinByCodeSource
    ) &&
    joinTableModalSource.includes("aria-busy={joining}") &&
    /joining \? \([\s\S]{0,180}ActivityIndicator[\s\S]{0,120}accessible=\{false\}[\s\S]{0,120}aria-hidden/.test(
      joinTableModalSource
    )
);
check(
  "Settings radio groups expose checked state directly to web accessibility",
  (settingsSource.match(/accessibilityRole="radiogroup"/g) ?? []).length >= 2 &&
    settingsSource.includes("aria-checked={lang === option}") &&
    settingsSource.includes("aria-checked={active}")
);
check(
  "progressive disclosures expose expanded state directly on web",
  installSource.includes("aria-expanded={guideOpen}") &&
    installSource.includes("aria-expanded={otherGuidesOpen}") &&
    homeSource.includes("aria-expanded={showAllHistory}") &&
    homeSource.includes("aria-expanded={supportDetailsOpen}") &&
    setupSource.includes("aria-expanded={customizationVisible}") &&
    setupSource.includes("aria-expanded={roundVariantsVisible}") &&
    gameSource.includes("aria-expanded={open}") &&
    scoreBreakdownSource.includes("aria-expanded={open}") &&
    whatsNewSource.includes("aria-expanded={historyOpen}")
);
check(
  "the Kraken toggle exposes pressed state directly on web",
  gameSource.includes("aria-pressed={discards.kraken > 0}")
);
check(
  "inviting and joining are one tap from the home screen",
  homeSource.includes("t.home.tableInvite") &&
    homeSource.includes("t.home.tableJoin") &&
    homeSource.includes("onInviteToTable") &&
    homeSource.includes("onJoinTable") &&
    appSource.includes("<TableInviteModal") &&
    appSource.includes("<JoinByCodeModal")
);
check(
  "settings expose invite and join as separate actions",
  settingsSource.includes("onPress={onInviteToTable}") &&
    settingsSource.includes("onPress={onJoinTable}") &&
    settingsSource.includes("t.settings.cloud.shareTitle") &&
    settingsSource.includes("t.settings.cloud.joinTitle")
);
check(
  "cross-screen modal and spectator controls keep reachable targets and recovery actions",
  rulesSource.includes("minHeight: 44") &&
    gameRulesSource.includes("minHeight: 44") &&
    supportModalSource.includes("<ScrollView") &&
    spectatorSource.includes("setRetryAttempt") &&
    spectatorSource.includes("!changingIdentity") &&
    spectatorSource.includes("minHeight: 44") &&
    liveShareSource.includes("copyTextToClipboard") &&
    liveShareSource.includes("Share.share") &&
    liveShareSource.includes("accessible={false}")
);
check(
  "compact modal close controls have explicit 44 point bounds",
  [joinByCodeSource, tableInviteSource, scoreBreakdownSource].every((source) =>
    /closeButton:\s*\{[^}]*\bwidth:\s*44,[^}]*\bheight:\s*44/.test(source)
  )
);
check(
  "touched screen and dialog titles expose heading semantics",
  installSource.includes('accessibilityRole="header"') &&
    analyticsSource.includes('accessibilityRole="header"') &&
    resultsSource.includes('accessibilityRole="header"') &&
    gameSource.includes('accessibilityRole="header"') &&
    joinByCodeSource.includes('accessibilityRole="header"') &&
    tableInviteSource.includes('accessibilityRole="header"') &&
    joinTableModalSource.includes('accessibilityRole="header"') &&
    lootTrackerSource.includes('accessibilityRole="header"') &&
    lootConfirmationSource.includes('accessibilityRole="header"') &&
    scoreBreakdownSource.includes('accessibilityRole="header"')
);
check(
  "key headers wrap cleanly under large text",
  settingsSource.includes("<View style={styles.headerSpacer} />") &&
    /title:\s*\{[^}]*\bflex:\s*1,[^}]*\bminWidth:\s*0,[^}]*\btextAlign:\s*"center"/.test(
      settingsSource
    ) &&
    setupSource.includes("<View style={styles.headerSpacer} />") &&
    /title:\s*\{[^}]*\bflex:\s*1,[^}]*\bminWidth:\s*0,[^}]*\btextAlign:\s*"center"/.test(
      setupSource
    ) &&
    !scoreBreakdownSource.includes(
      'style={styles.playerName} numberOfLines={1} accessibilityRole="header"'
    ) &&
    whatsNewSource.includes(
      'style={styles.releaseTitle} accessibilityRole="header"'
    )
);
check(
  "the native Rules sheet reserves the device safe area",
  rulesSource.includes("SafeAreaView") &&
    rulesSource.includes("<SafeAreaView style={[styles.sheet")
);
check(
  "the Settings release row uses the shared vector icon family",
  settingsSource.includes('name="star-four-points-outline"') &&
    !settingsSource.includes('<Text style={styles.whatsNewIcon}>✦</Text>')
);
check(
  "spectator sorting is one radiogroup rather than selected buttons",
  spectatorSource.includes('accessibilityRole="radiogroup"') &&
    spectatorSource.includes('accessibilityRole="radio"') &&
    !spectatorSource.includes('accessibilityState={{ selected: active }}')
);
check(
  "settings let the crew name their shared table",
  settingsSource.includes("t.settings.cloud.tableNameLabel") &&
    settingsSource.includes("onRenameTable")
);
check(
  "statistics display the shared table name",
  statsSource.includes("tableName") && appSource.includes("tableName={tableName}")
);
check(
  "settings list every table with a switch and a way to add one",
  settingsSource.includes("t.settings.cloud.tablesTitle") &&
    settingsSource.includes("onSwitchTable(membership.ownerId)") &&
    settingsSource.includes("t.settings.cloud.newTable")
);
check(
  "the last remaining table cannot be removed by accident",
  settingsSource.includes("tables.length > 1 ? (") &&
    appSource.includes("if (tablesRef.current.length <= 1) return;")
);
check(
  "joining a table keeps the other tables instead of merging histories",
  appSource.includes("const handleJoinTable") &&
    appSource.includes("adoptTableData(data, owner)") &&
    !appSource.includes("mergeBackupData(\n      localData,")
);
check(
  "a table change flushes pending games to the table being left",
  appSource.includes("flushBeforeTableChange") &&
    appSource.includes("await cloudBackupManager().flushPending()")
);
// A merge is a union, so a deletion that leaves no trace is undone by the first
// crew mate whose device still holds the game — it reappears in the history and
// back in everyone's stats.
check(
  "deleting a game records a tombstone that travels with the table",
  appSource.includes(
    "applyDeletions(recordDeletions(deletionsRef.current, [gameId], Date.now()))"
  ) && appSource.includes("deletions: deletionsRef.current")
);
check(
  "clearing the whole history tombstones every game it removes",
  appSource.includes("const handleDeleteAllGames") &&
    appSource.includes("recordDeletions(deletionsRef.current, deletedIds")
);
check(
  "a deletion reaches the cloud without waiting out the push debounce",
  appSource.includes("const pushCloudNow") &&
    appSource.includes("void cloudBackupManager().flushPending();") &&
    appSource.includes("pushCloudNow(nextCurrent, next);")
);
check(
  "tombstones are swapped with the table they belong to",
  appSource.includes("applyDeletions(data.deletions ?? {})")
);

// React Native Web deletes `direction` from a StyleSheet and logs an error for
// it, so a view that must not mirror under Arabic cannot ask for it that way —
// it has to go through LtrView, which sets the DOM `dir` attribute on web.
// Without this the podium renders bronze-gold-silver in a right-to-left locale.
const rnStyleSources: [string, string][] = [
  ["src/components/Podium.tsx", podiumSource],
  ["src/components/SupportModal.tsx", supportModalSource],
  ["src/components/ScoreChart.tsx", chartSource],
  ["src/screens/GameScreen.tsx", gameSource],
  ["src/screens/HomeScreen.tsx", homeSource],
  ["src/screens/ResultsScreen.tsx", resultsSource],
  ["src/screens/SetupScreen.tsx", setupSource],
];
for (const [name, source] of rnStyleSources) {
  const stylesheet = source.slice(source.indexOf("StyleSheet.create("));
  check(
    `${name} keeps "direction" out of its StyleSheet`,
    !/\bdirection:\s*["']/.test(stylesheet),
    'react-native-web rejects it; wrap the view in LtrView instead'
  );
}
// A Kraken is not the only way a trick ends with no winner: the White Whale
// discards its trick whenever it catches nothing but special cards, and the
// expansion adds rarer standoffs. The Kraken keeps its one-tap button; every
// other cause goes into a plain counter, and the round's trick check reads
// the total of the two.
check(
  "the Kraken keeps its button next to a counter for every other discard",
  gameSource.includes("t.game.krakenRecord") &&
    gameSource.includes("t.game.discardedOther") &&
    gameSource.includes("t.game.discardedHint") &&
    gameSource.includes("setDiscards({ kraken: discards.kraken > 0 ? 0 : 1 })") &&
    gameSource.includes("onChange={(other) => setDiscards({ other })}")
);
check(
  "the trick check counts every discarded trick, named or not",
  gameSource.includes("tricksTotal + discards.total") &&
    gameSource.includes("ghostTricks(game, tricksTotal, cards, discards.total)")
);
check(
  "the podium keeps its silver-gold-bronze shape in RTL",
  podiumSource.includes("<LtrView style={styles.podiumRow}>")
);
check(
  "the chart legend mirrors with the rest of the interface",
  chartSource.includes("<View style={styles.legend}>") &&
    !chartSource.includes("<LtrView")
);
check(
  "LtrView sets the DOM dir attribute on web, not a direction style",
  ltrViewSource.includes('dir: "ltr"') &&
    ltrViewSource.includes('Platform.OS === "web"')
);

// react-native-web resolves every logical edge into physical CSS using its own
// locale context, not the DOM's dir attribute, and that context defaults to
// left-to-right. Without this provider wired in, marginStart and friends behave
// exactly like marginLeft and nothing mirrors for Arabic. LocaleProvider is not
// re-exported from the package index, so guard the module path: if an upgrade
// moves it, this fails here rather than silently un-mirroring the app.
check(
  "the i18n provider hands react-native-web its writing direction",
  i18nContextSource.includes("<DirectionProvider lang={lang}>") &&
    directionProviderSource.includes(
      'require("react-native-web/dist/modules/useLocale")'
    )
);
check(
  "react-native-web still exposes LocaleProvider where we import it",
  typeof localeModule.LocaleProvider === "function",
  `exports: ${Object.keys(localeModule).join(", ")}`
);

// Physical edges never flip; RN's start/end equivalents map to CSS logical
// properties on web and to Yoga's own logical edges on native. A stray
// physical edge leaves a gap, divider or accent bar on the wrong side in
// Arabic while everything around it mirrors.
for (const [name, source] of [
  ...rnStyleSources,
  ["src/components/LootTracker.tsx", lootTrackerSource],
  ["src/components/ScoreBreakdownModal.tsx", scoreBreakdownSource],
  ["src/components/RulesModal.tsx", rulesSource],
  ["src/components/BonusEditor.tsx", bonusEditorSource],
  ["src/components/GameRulesModal.tsx", gameRulesSource],
] as [string, string][]) {
  const stylesheet = source.slice(source.indexOf("StyleSheet.create("));
  const physical = stylesheet.match(
    /\b(margin|padding)(Left|Right):|\bborder(Left|Right)(Width|Color|Style):/g
  );
  check(
    `${name} uses logical edges, not left/right`,
    physical === null,
    physical ? `found ${[...new Set(physical)].join(", ")}` : ""
  );
}

for (const [language, strings] of Object.entries({ en, fr, es, de, ar, zh })) {
  check(
    `${language} labels provisional scores`,
    strings.game.roundPointsPreview.trim().length > 0
  );
  check(
    `${language} names both ways to record a trick with no winner`,
    [
      strings.game.discardedTitle,
      strings.game.discardedOther,
      strings.game.krakenRecord,
      strings.game.krakenRecorded,
      strings.game.krakenUndo,
      strings.game.discardedHint,
    ].every((label) => label.trim().length > 0) &&
      strings.game.discardedHint.length <= 160
  );
  check(
    `${language} release notes describe only this release`,
    strings.whatsNew.items.length > 0 && strings.whatsNew.items.length <= 5
  );
  check(
    `${language} keeps release notes short enough to read`,
    [
      ...strings.whatsNew.items,
      ...Object.values(strings.whatsNew.history).flat(),
    ].every((item) => item.length <= 160)
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
