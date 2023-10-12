import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Game, Player } from '@types';
import { HeaderOptions } from '@components/layout/HeaderOptions';
import { ButtonIcon } from '@components/shared/ButtonIcon';
import { BsCheckLg, GiMeeple } from '@components/shared/Icons';
import { CardPlayer } from '@components/cards';
import { ButtonNewPlayer } from '@components/cards/ButtonNewPlayer';
import { useGameStore } from '@lib';
import { usePlayers } from '@hooks';
import { EXTENSIONS } from '@constants';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 7;

export default function NewGame() {
  const navigate = useNavigate();
  const [dbPlayers] = usePlayers();
  const [playersInGame, setPlayersInGame] = useState<Player[]>([]);
  const storePlayers = useGameStore((s) => s.players);
  const setPlayers = useGameStore((s) => s.setPlayers);
  const setExtensions = useGameStore((s) => s.setExtensions);

  useEffect(() => {
    const players = storePlayers.length
      ? storePlayers
      : dbPlayers.filter((p) => p.isFavorite).slice(0, MAX_PLAYERS);
    setPlayersInGame(players);
  }, [dbPlayers, storePlayers]);

  const addPlayerIntoTheGame = (player: Player) => () => {
    if (playersInGame.some((p) => p.idPlayer === player.idPlayer)) {
      removePlayerFromTheGame(player.idPlayer)();
      return;
    }
    if (playersInGame.length >= MAX_PLAYERS) return;

    setPlayersInGame((p) => [...p, player]);
  };

  const removePlayerFromTheGame = (playerId: Player['idPlayer']) => () => {
    setPlayersInGame((p) => p.filter((player) => player.idPlayer !== playerId));
  };

  useEffect(() => {
    if (playersInGame.length >= MIN_PLAYERS) setPlayers(playersInGame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playersInGame]);

  const launchGame = () => {
    const extensions = {
      ...EXTENSIONS.reduce(
        (a, e) => ({ ...a, [e]: false }),
        {} as Game
      ),
      ...JSON.parse(localStorage.getItem('settings') ?? '{}'),
    };
    setExtensions(extensions);
    navigate('/scores/military');
  };

  const emptyPlayers = Array.from({
    length: MAX_PLAYERS - playersInGame.length,
  });

  return (
    <section className="h-full overflow-y-auto">
      <HeaderOptions>
        {playersInGame.length >= MIN_PLAYERS && (
          <ButtonIcon icon={BsCheckLg} onClick={launchGame} />
        )}
      </HeaderOptions>
      <header className="bg-wonders-blue">
        <main className="mx-auto grid max-w-[800px] grid-cols-4 gap-2 p-4">
          {playersInGame.map((player) => (
            <CardPlayer
              key={player.idPlayer}
              {...player}
              onClick={removePlayerFromTheGame(player.idPlayer)}
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
        {dbPlayers.map((player) => (
          <CardPlayer
            key={player.idPlayer}
            {...player}
            showInGame={playersInGame.some((p) => p.idPlayer === player.idPlayer)}
            onClick={addPlayerIntoTheGame(player)}
          />
        ))}

        <ButtonNewPlayer />
      </main>
    </section>
  );
}
