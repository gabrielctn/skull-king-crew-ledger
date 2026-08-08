export const APP_SCREENS = [
  "home",
  "setup",
  "game",
  "results",
  "settings",
  "stats",
] as const;

export type AppScreen = (typeof APP_SCREENS)[number];
export type BackAction = "close-modal" | "home" | "exit";
export interface HistoryGame {
  id: string;
  status: "in_progress" | "finished";
}
export interface RestoredHistoryRoute {
  screen: AppScreen;
  gameId: string | null;
}

export function isAppScreen(value: unknown): value is AppScreen {
  return typeof value === "string" && APP_SCREENS.includes(value as AppScreen);
}

export function screenFromHistoryState(state: unknown): AppScreen {
  if (
    state !== null &&
    typeof state === "object" &&
    isAppScreen((state as { skullKingScreen?: unknown }).skullKingScreen)
  ) {
    return (state as { skullKingScreen: AppScreen }).skullKingScreen;
  }
  return "home";
}

export function historyStateForScreen(
  state: unknown,
  screen: AppScreen,
  gameId?: string
): Record<string, unknown> {
  const base =
    state !== null && typeof state === "object"
      ? (state as Record<string, unknown>)
      : {};
  const { skullKingGameId: _previousGameId, ...preserved } = base;
  return {
    ...preserved,
    skullKingScreen: screen,
    ...(gameId ? { skullKingGameId: gameId } : {}),
  };
}

/** Resolves a history entry without letting a stale game id render invalid UI. */
export function restoredHistoryRoute(
  state: unknown,
  games: readonly HistoryGame[]
): RestoredHistoryRoute {
  const screen = screenFromHistoryState(state);
  if (screen !== "game" && screen !== "results") {
    return { screen, gameId: null };
  }
  const gameId =
    state !== null && typeof state === "object"
      ? (state as { skullKingGameId?: unknown }).skullKingGameId
      : null;
  if (typeof gameId !== "string") return { screen: "home", gameId: null };
  const game = games.find((candidate) => candidate.id === gameId);
  if (!game || (screen === "results" && game.status !== "finished")) {
    return { screen: "home", gameId: null };
  }
  return { screen, gameId };
}

/** Global modal dismissal always wins over route navigation. */
export function backActionForState({
  modalOpen,
  screen,
}: {
  modalOpen: boolean;
  screen: AppScreen;
}): BackAction {
  if (modalOpen) return "close-modal";
  return screen === "home" ? "exit" : "home";
}
