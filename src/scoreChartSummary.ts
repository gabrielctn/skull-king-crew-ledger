import type { PlayerScoreSeries } from "./stats";

export interface ScoreChartSummary {
  playerId: string;
  name: string;
  label: string;
  points: Array<{
    roundNumber: number;
    total: number;
    label: string;
  }>;
}

/** Keep score signs identical in native rows, the web chart, and its summary. */
export function createScoreChartFormatters(locale: string) {
  const number = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
    signDisplay: "exceptZero",
  });
  return { formatTotal: number.format };
}

/** Build the identical localized, concise score rows for web and native. */
export function scoreChartSummaries(
  series: PlayerScoreSeries[],
  formatTotal: (total: number) => string,
  formatPoint: (round: number, total: string) => string,
  formatPlayer: (name: string, points: string[]) => string
): ScoreChartSummary[] {
  return series.map((player) => {
    const points = player.points.map((point) => ({
      roundNumber: point.roundNumber,
      total: point.total,
      label: formatPoint(point.roundNumber, formatTotal(point.total)),
    }));
    return {
      playerId: player.playerId,
      name: player.name,
      label: formatPlayer(player.name, points.map((point) => point.label)),
      points,
    };
  });
}
