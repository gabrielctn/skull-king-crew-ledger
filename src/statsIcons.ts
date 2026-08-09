/** Stable decorative glyph choices for the Stats screen. */
export const STATS_ICON_META = {
  empty: { name: "map-outline" },
  crew: { name: "trophy-outline" },
  totalGames: { name: "calendar-blank" },
  totalRounds: { name: "cards-playing-outline" },
  totalPlunder: { name: "treasure-chest-outline" },
  totalPlayers: { name: "account-group-outline" },
  bestFinalScore: { name: "crown" },
  biggestRound: { name: "treasure-chest" },
  bestExactBid: { name: "target" },
  zeroBidMaster: { name: "circle-off-outline" },
  longestStreak: { name: "fire" },
  biggestComeback: { name: "compass-outline" },
  biggestBonusHaul: { name: "diamond-stone" },
  worstFinalScore: { name: "skull-outline" },
  worstRound: { name: "wave-arrow-down" },
  mostLastPlaces: { name: "hook" },
  boldestBidder: { name: "bomb" },
} as const;

export type StatsIconKey = keyof typeof STATS_ICON_META;
