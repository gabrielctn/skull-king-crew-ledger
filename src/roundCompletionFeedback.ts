import type { Game } from "./types";

export type FinalRoundHaptic = "impact" | "success";

/** A correction keeps the game's original completion feedback subdued. */
export function finalRoundHaptic(
  game: Pick<Game, "status" | "finishedAt">
): FinalRoundHaptic {
  return game.status === "finished" || game.finishedAt !== null
    ? "impact"
    : "success";
}
