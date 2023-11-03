import { useNavigate } from 'react-router-dom';
import type { Player } from '@types';
import { Section } from '@components/layout';
import { HeaderOptions } from '@components/layout/HeaderOptions';
import { ButtonIcon } from '@components/shared/ButtonIcon';
import { BsCheckLg, GiMeeple } from '@components/shared/Icons';
import { ButtonNewPlayer, CardPlayer } from '@components/cards';
import { useGameStore } from '@lib';
import { usePlayers } from '@hooks';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 7;

export default function NewGame() {
  const navigate = useNavigate();
  const [dbPlayers] = usePlayers();

  const storePlayers = useGameStore((s) => s.players);
  const setStorePlayers = useGameStore((s) => s.setPlayers);
  const setExtensions = useGameStore((s) => s.setExtensions);

  const playersInGame = storePlayers.length
    ? storePlayers.filter((p) => !p.isDeleted)
    : dbPlayers
        .filter((p) => p.isFavorite && !p.isDeleted)
        .slice(0, MAX_PLAYERS);

  const sortedPlayed = [...dbPlayers]
    .filter((p) => !p.isDeleted)
    .sort((a, b) => {
      if (a.isArchived === b.isArchived) {
        return a.name.localeCompare(b.name);
      }
      return a.isArchived ? 1 : -1;
    });

  const addPlayerIntoTheGame = (player: Player) => () => {
    if (playersInGame.some((p) => p.idPlayer === player.idPlayer)) {
      removePlayerFromTheGame(player.idPlayer)();
      return;
    }
    if (playersInGame.length >= MAX_PLAYERS) return;

    setStorePlayers([...playersInGame, player]);
  };

  const removePlayerFromTheGame = (playerId: Player['idPlayer']) => () => {
    setStorePlayers(
      playersInGame.filter((player) => player.idPlayer !== playerId)
    );
  };

  const launchGame = () => {
    const extensions = JSON.parse(localStorage.getItem('settings') ?? '[]');
    setStorePlayers(playersInGame);
    setExtensions(extensions);
    navigate('/scores/military');
  };

  const emptyPlayers = Array.from({
    length: MAX_PLAYERS - playersInGame.length,
  });

  return (
    <main>
      <HeaderOptions>
        {playersInGame.length >= MIN_PLAYERS && (
          <ButtonIcon icon={BsCheckLg} onClick={launchGame} />
        )}
      </HeaderOptions>

      <div className="flex h-section flex-col">
        <header className="bg-wonders-blue">
          <main className="mx-auto grid max-w-app grid-cols-4 gap-2 p-4">
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

        <Section className="w-full @container">
          <div className="grid grid-cols-3 gap-2 @[450px]:grid-cols-4">
            {sortedPlayed.map((player) => (
              <CardPlayer
                key={player.idPlayer}
                {...player}
                showInGame={playersInGame.some(
                  (p) => p.idPlayer === player.idPlayer
                )}
                onClick={addPlayerIntoTheGame(player)}
              />
            ))}

            <ButtonNewPlayer />
          </div>
        </Section>
      </div>
    </main>
  );
}
