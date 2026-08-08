import type { Game } from "./types";

export type FinalRoundHaptic = "impact" | "success";

export function gameHadCompleted(
  game: Pick<Game, "status" | "finishedAt">
): boolean {
  return game.status === "finished" || game.finishedAt !== null;
}

/** A correction keeps the game's original completion feedback subdued. */
export function finalRoundHaptic(gameHadCompleted: boolean): FinalRoundHaptic {
  return gameHadCompleted ? "impact" : "success";
}
