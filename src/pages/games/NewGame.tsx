import { useEffect, useState } from 'react';

import { CardNewPlayer } from '@/components/cards/CardNewPlayer';
import { CardPlayerNewGame } from '@/components/cards/CardPlayerNewGame';
import { GiMeeple } from '@/components/shared/Icons';
import { usePlayers } from '@/hooks/usePlayers';

const MAX_PLAYERS = 7;

export default function NewGame() {
  const [players] = usePlayers();
  const [playersInGame, setPlayersInGame] = useState<Player[]>([]);

  useEffect(() => {
    const favoritePlayers = players.filter(p => p.isFavorite === 'true').slice(0, MAX_PLAYERS);
    setPlayersInGame(favoritePlayers)
  }, [players])

  const addPlayerIntoTheGame = (player: Player) => () => {
    if (playersInGame.includes(player)) {
      removePlayerFromTheGame(player.id)();
      return;
    }
    if (playersInGame.length >= MAX_PLAYERS) return;

    setPlayersInGame((p) => [...p, player]);
  };

  const removePlayerFromTheGame = (playerId: Player['id']) => () => {
    setPlayersInGame((p) => p.filter((player) => player.id !== playerId));
  };

  const emptyPlayers = Array.from({
    length: MAX_PLAYERS - playersInGame.length,
  });

  return (
    <section>
      <header className="h-60 bg-wonders-blue">
        <main className="mx-auto grid max-w-[800px] grid-cols-4 gap-2 p-4">
          {playersInGame.map((player) => (
            <CardPlayerNewGame
              key={player.id}
              {...player}
              onClick={removePlayerFromTheGame(player.id)}
            />
          ))}
          {emptyPlayers.map((_,i) => (
            <div key={i} className="flex aspect-square w-full items-center justify-center bg-wonders-blue-dark transition-all">
              <GiMeeple size={'3rem'} />
            </div>
          ))}
        </main>
      </header>

      <main className="mx-auto grid max-w-[800px] grid-cols-3 gap-2 p-4">
        {players.map((player) => (
          <CardPlayerNewGame
            key={player.id}
            {...player}
            inGame={playersInGame.some((p) => p.id === player.id)}
            onClick={addPlayerIntoTheGame(player)}
          />
        ))}

        <CardNewPlayer />
      </main>
    </section>
  );
}
