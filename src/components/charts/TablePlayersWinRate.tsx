import { Fragment, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLoaderData } from 'react-router-dom';
import { loaderStatistics } from '@/lib/loaders';
import { getPlayersStats } from '@/lib/utils/statistics';
import { CardPlayer } from '../cards';

export function TablePlayersWinRate() {
  const { t } = useTranslation(undefined, { keyPrefix: 'statistics' });
  const { games, players } = useLoaderData() as LoaderData<
    typeof loaderStatistics
  >;

  const playersStats = getPlayersStats(games);

  return (
    <div className="grid grid-cols-3 [&>*:nth-child(6n+1)]:bg-white/5 [&>*:nth-child(6n+2)]:bg-white/5 [&>*:nth-child(6n+3)]:bg-white/5">
      <THead>{t('name')}</THead>
      <THead>{t('win_rate')}</THead>
      <THead>{t('games')}</THead>

      {players.map((player) => (
        <Fragment key={player.idPlayer}>
          <TBody>
            <Link to={`/statistics/${player.idPlayer}`}>
              <CardPlayer
                {...player}
                className="aspect-square h-full max-w-[50px]"
                classNameH2="text-xs font-normal"
              />
            </Link>
          </TBody>
          {playersStats[player.idPlayer] ? (
            <>
              <TBody>
                {Math.round(
                  (playersStats[player.idPlayer].wins /
                    playersStats[player.idPlayer].played) *
                    100
                )}
                %
              </TBody>
              <TBody>{playersStats[player.idPlayer].played}</TBody>
            </>
          ) : (
            <>
              <TBody>0%</TBody>
              <TBody>0</TBody>
            </>
          )}
        </Fragment>
      ))}
    </div>
  );
}

function THead({ children }: PropsWithChildren) {
  return (
    <div className="flex items-center justify-center p-2 font-bold">
      {children}
    </div>
  );
}

function TBody({ children }: PropsWithChildren) {
  return <div className="flex items-center justify-center">{children}</div>;
}
