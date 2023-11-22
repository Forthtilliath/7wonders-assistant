import { GameHistoriesComplete } from '@/@types';

const DEFAULT_STATS: ReadonlyObject<'wins' | 'played'> = Object.freeze({
  wins: 0,
  played: 0,
});

export function getPlayersStats(games: GameHistoriesComplete[]) {
  return games.reduce(
    (stats, { scores }) => {
      scores.forEach(({ idPlayer, ranking }) => {
        if (!stats[idPlayer]) {
          stats[idPlayer] = { ...DEFAULT_STATS };
        }
        if (ranking === 1) {
          stats[idPlayer].wins++;
        }
        stats[idPlayer].played++;
      });

      return stats;
    },
    {} as Record<number, { wins: number; played: number }>
  );
}

export function getPlayerStats(
  games: GameHistoriesComplete[],
  playerId: number
) {
  const playersStats = getPlayersStats(games);

  return playersStats[playerId] ?? { ...DEFAULT_STATS };
}
