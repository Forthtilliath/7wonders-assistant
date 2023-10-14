import { useLoaderData } from 'react-router-dom';
import type { GameHistoriesComplete } from '@types';
import { HeaderOptions, Section } from '@components/layout';
import { ButtonIcon } from '@components/shared';
import { DisplayObject } from '@components/dev/DisplayObject';

export default function History() {
  const games = useLoaderData() as GameHistoriesComplete[];
  console.log(games);

  return (
    <main>
      <HeaderOptions>
        <ButtonIcon icon={() => <></>} aria-label="" />
      </HeaderOptions>

      <Section>
        <DisplayObject data={games} />
        {games.map((gameHistories) => (
          <div key={gameHistories.game.idGame}>
            <header>
              <h2>
                {gameHistories.game.idGame} - {gameHistories.game.createdAt}
              </h2>
            </header>
            <main>
              {gameHistories.scores.map((score) => (
                <div key={score.idPlayer}>
                  {score.idPlayer} - {score.total}
                </div>
              ))}
            </main>
          </div>
        ))}
      </Section>
    </main>
  );
}
