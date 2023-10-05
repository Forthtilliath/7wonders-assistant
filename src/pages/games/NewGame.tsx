import { useState } from 'react';

import { CardNewPlayer } from '@/components/cards/CardNewPlayer';
import { CardPlayerNewGame } from '@/components/cards/CardPlayerNewGame';
import { usePlayers } from '@/hooks/usePlayers';

const MAX_PLAYERS = 7;

export default function NewGame() {
  const [playersInGame, setPlayersInGame] = useState<Player[]>([]);
  const [players] = usePlayers();

  const addPlayerIntoTheGame = (player: Player) => () => {
    if (playersInGame.length >= MAX_PLAYERS) return;
    if( playersInGame.includes(player) ) return;

    setPlayersInGame((p) => [...p, player]);
  };

  const removePlayerFromTheGame = (playerId: Player['id']) => () => {
    setPlayersInGame((p) => p.filter((player) => player.id !== playerId));
  };

  return (
    <section>
      <header className="h-60 bg-wonders-blue">
        <main className="mx-auto grid max-w-[800px] grid-cols-3 gap-2 p-4">
          {playersInGame.map((player) => (
            <CardPlayerNewGame
              key={player.id}
              {...player}
              onClick={removePlayerFromTheGame(player.id)}
            />
          ))}
        </main>
      </header>

      <main className="mx-auto grid max-w-[800px] grid-cols-3 gap-2 p-4">
        {players.map((player) => {
          const inGame = playersInGame.some((p) => p.id === player.id);
          return (
            <CardPlayerNewGame
              key={player.id}
              {...player}
              inGame={inGame}
              onClick={addPlayerIntoTheGame(player)}
              // onClick={inGame ? () => {} : addPlayerIntoTheGame(player)}
            />
          );
        })}

        <CardNewPlayer />
      </main>
    </section>
  );
}
