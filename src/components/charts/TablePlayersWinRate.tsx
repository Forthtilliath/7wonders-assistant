import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router-dom';
import { loaderStatistics } from '@/lib/loaders';

export function TablePlayersWinRate() {
  const { games, players } = useLoaderData() as LoaderData<
    typeof loaderStatistics
  >;
  const { t } = useTranslation(undefined, { keyPrefix: 'statistics' });

  /**
   * {
   *   idPlayer: {
   *     wins: number,
   *     played: number
   *   }
   * }
   */

  const playersStat = games.reduce(
    (stats, { scores }) => {
      //
      console.log(scores); //array : idPlayer & ranking
      scores.forEach(({ idPlayer, ranking }) => {
        if (!stats[idPlayer]) {
          stats[idPlayer] = {
            wins: 0,
            played: 0,
          };
        }
        if (ranking) {
          stats[idPlayer].wins++;
        }
        stats[idPlayer].played++;
      });

      return stats;
    },
    {} as Record<number, { wins: number; played: number }>
  );
  console.log(playersStat);

  // useEffect(() => {
  //   console.log(players)
  //   console.log(games)
  // }, [games, players])

  /**
   * TODO :
   * - [x] Récupérer les parties
   * - [ ] Les rassembler par joueur
   * - [ ] Compter le nombre de parties que chaque joueur a fini premier
   * - [ ] Compter le nombre de parties que chaque joueur a joué
   */

  return (
    <div className="grid grid-cols-4">
      <div className="col-span-2">{t('name')}</div>
      <div>{t('win_rate')}</div>
      <div>{t('games')}</div>

      {players.map((player) => (
        <Fragment key={player.idPlayer}>
          <div></div>
          <div>{player.name}</div>
          <div>100%</div>
          <div>15</div>
        </Fragment>
      ))}
    </div>
  );
}
