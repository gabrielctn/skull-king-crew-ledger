import { normalizePlayerName } from "./stats";

export const MAX_SETUP_PLAYERS = 8;

interface SetupPlayer {
  name: string;
}

export interface SetupPlayerValidation<T extends SetupPlayer = SetupPlayer> {
  named: T[];
  duplicateName: string | null;
  canStart: boolean;
  canAdd: boolean;
}

/**
 * New-game-only player validation. Saved games keep their original player
 * lists and are deliberately never passed through this check.
 */
export function validateSetupPlayers<T extends SetupPlayer>(
  players: readonly T[]
): SetupPlayerValidation<T> {
  const named: T[] = [];
  for (const player of players) {
    const name = player.name.trim();
    if (name) named.push({ ...player, name });
  }
  const identities = new Set<string>();
  let duplicateName: string | null = null;

  for (const player of named) {
    const identity = normalizePlayerName(player.name);
    if (identities.has(identity)) {
      duplicateName = player.name;
      break;
    }
    identities.add(identity);
  }

  return {
    named,
    duplicateName,
    canStart:
      players.length <= MAX_SETUP_PLAYERS &&
      named.length >= 2 &&
      named.length <= MAX_SETUP_PLAYERS &&
      duplicateName === null,
    canAdd: players.length < MAX_SETUP_PLAYERS,
  };
}
