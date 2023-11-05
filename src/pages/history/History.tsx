import { useTranslation } from 'react-i18next';
import ReactJson from 'react-json-view';
import { Link, useLoaderData } from 'react-router-dom';
import { t } from 'i18next';
import type { GameHistoriesComplete } from '@types';
import { HeaderOptions, Section } from '@components/layout';
import { GroupInputs } from '@components/shared';
import { CardPlayer } from '@components/cards';
import { formatDate } from '@helpers';

export default function History() {
  const games = useLoaderData() as GameHistoriesComplete[];
  const { i18n } = useTranslation();

  return (
    <main>
      <HeaderOptions></HeaderOptions>

      <Section className="flex flex-col gap-4">
        {games.length === 0 && <p>No game found</p>}
        {games.map((gameHistories) => (
          <GroupInputs
            key={gameHistories.game.idGame}
            title={t('history.game') + ' ' + gameHistories.game.idGame}
            className="flex flex-col gap-4 rounded bg-wonders-blue-dark px-2 py-4">
            <header className="flex items-center justify-between gap-4 p-2">
              <h2>{formatDate(gameHistories.game.createdAt, i18n.language)}</h2>
              <Link
                to={'/history/' + gameHistories.game.idGame}
                className="rounded bg-slate-700 p-2">
                {t('history.show')}
              </Link>
            </header>
            <main className="grid grid-cols-4 gap-2">
              {gameHistories.scores.map((score) => (
                <div key={score.idPlayer} className="flex flex-col gap-2">
                  <CardPlayer
                    {...score.player}
                    className="mx-auto w-14"
                    classNameH2="text-xs p-0"
                  />
                  <div className="rounded bg-wonders-blue text-center font-semibold text-wonders-yellow">
                    {score.total}
                  </div>
                </div>
              ))}
            </main>
          </GroupInputs>
        ))}

        <ReactJson
          src={games}
          theme={'bright'}
          iconStyle="square"
          collapsed={true}
          displayDataTypes={false}
          displayObjectSize={false}
        />
      </Section>
    </main>
  );
}