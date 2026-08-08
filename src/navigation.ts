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
  screen: AppScreen
): Record<string, unknown> {
  return {
    ...(state !== null && typeof state === "object" ? state : {}),
    skullKingScreen: screen,
  };
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
