import { useLoaderData } from 'react-router-dom';
import { getPlayerStats } from '@/lib/utils/statistics';
import { loaderPlayerStatistics } from '@lib/loaders';

export function PlayerStatistics() {
  const { games, player } = useLoaderData() as LoaderData<
    typeof loaderPlayerStatistics
  >;

  /*

  */
  console.log(getPlayerStats(games, player.idPlayer));

  return (
    <>
      <h2>{player.name}</h2>

      {/* Graph Pie => Winrate */}
      {/* Dans le graph => Winrate 85,00% */}
      {/* A droite, récap : Games / Won / Losts ? */}

      {/* Graph Line => Score de chaque parties */}
      {/* Avg score */}
      {/* Higest score */}
      {/* Lowest score */}

      {/* Graph Bar & Pie => Average Score Distribution */}
      {/* Bar => Flat values */}
      {/* Pie => Pourcent values */}

      {/* Array : Opponents */}
      {/* Avatar/Name/Win/Best/Worst/Lost ? */}
    </>
  );
}
