import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CardNewPlayer } from '@/components/cards/CardNewPlayer';
import { CardPlayerNewGame } from '@/components/cards/CardPlayerNewGame';
import { HeaderOptions } from '@/components/layout/HeaderOptions';
import { ButtonIcon } from '@/components/shared/ButtonIcon';
import { BsCheckLg, GiMeeple } from '@/components/shared/Icons';
import { usePlayers } from '@/hooks/usePlayers';
import { useGameStore } from '@/lib/gameStore';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 7;

export default function NewGame() {
  const navigate = useNavigate();
  const [players] = usePlayers();
  const [playersInGame, setPlayersInGame] = useState<Player[]>([]);
  const setPlayers = useGameStore(s => s.setPlayers)

  useEffect(() => {
    const favoritePlayers = players
      .filter((p) => p.isFavorite === 'true')
      .slice(0, MAX_PLAYERS);
    setPlayersInGame(favoritePlayers);
  }, [players]);

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

  const launchGame = () => {
    // console.log(playersInGame);
    setPlayers(playersInGame)

    navigate('/scores/military');
  };

  const emptyPlayers = Array.from({
    length: MAX_PLAYERS - playersInGame.length,
  });

  return (
    <section className="h-full overflow-y-auto">
      <HeaderOptions>
        {playersInGame.length >= MIN_PLAYERS && (
          <ButtonIcon icon={BsCheckLg} onClick={launchGame} type="button" />
        )}
      </HeaderOptions>
      <header className="bg-wonders-blue">
        <main className="mx-auto grid max-w-[800px] grid-cols-4 gap-2 p-4">
          {playersInGame.map((player) => (
            <CardPlayerNewGame
              key={player.id}
              {...player}
              onClick={removePlayerFromTheGame(player.id)}
            />
          ))}
          {emptyPlayers.map((_, i) => (
            <div
              key={i}
              className="flex aspect-square w-full items-center justify-center bg-wonders-blue-dark transition-all">
              <GiMeeple size={'60%'} />
            </div>
          ))}
        </main>
      </header>

      <main className="mx-auto grid h-full max-w-[800px] auto-rows-min grid-cols-3 gap-2 overflow-y-auto p-4">
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
