import ReactJson from 'react-json-view';
import { useLoaderData } from 'react-router-dom';
import type { GameHistoriesComplete } from '@types';
import { HeaderOptions, Section } from '@components/layout';
import { ButtonIcon } from '@components/shared';
import { CardPlayer } from '@components/cards';
import { formatDate } from '@helpers';

export default function History() {
  const games = useLoaderData() as GameHistoriesComplete[];

  return (
    <main>
      <HeaderOptions>
        <ButtonIcon icon={() => <></>} aria-label="" />
      </HeaderOptions>

      <Section>
        {games.length === 0 && <p>No game found</p>}
        {games.map((gameHistories) => (
          <div key={gameHistories.game.idGame}>
            <header>
              <h2>
                {gameHistories.game.idGame} -{' '}
                {formatDate(gameHistories.game.createdAt)}
              </h2>
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
          displayDataTypes={false}
          displayObjectSize={false}
        />
      </Section>
    </main>
  );
}
