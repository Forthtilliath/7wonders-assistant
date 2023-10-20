import { useTranslation } from 'react-i18next';
import ReactJson from 'react-json-view';
import { Link, useLoaderData } from 'react-router-dom';
import type { GameHistoriesComplete } from '@types';
import { HeaderOptions, Section } from '@components/layout';
import { ButtonIcon } from '@components/shared';
import { CardPlayer } from '@components/cards';
import { formatDate } from '@helpers';

export default function History() {
  const games = useLoaderData() as GameHistoriesComplete[];
  const { i18n } = useTranslation();

  return (
    <main>
      <HeaderOptions>
        <ButtonIcon icon={() => <></>} aria-label="" />
      </HeaderOptions>

      <Section>
        {games.length === 0 && <p>No game found</p>}
        {games.map((gameHistories) => (
          <div key={gameHistories.game.idGame}>
            <header className="flex justify-between">
              <h2>
                {gameHistories.game.idGame} -{' '}
                <Link to={'/history/' + gameHistories.game.idGame}>
                  Show the game
                </Link>
              </h2>
              <span>
                {formatDate(gameHistories.game.createdAt, i18n.language)}
              </span>
            </header>
            <main className="flex">
              {gameHistories.scores.map((score) => (
                <div key={score.idPlayer}>
                  <CardPlayer
                    {...score.player}
                    className="w-12"
                    classNameH2="text-xs p-0"
                  />
                  <div className="text-center">{score.total}</div>
                </div>
              ))}
            </main>
          </div>
        ))}
        {/* bright / monokai / pop */}
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
