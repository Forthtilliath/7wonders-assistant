import { ButtonNewPlayer } from '@components/cards/ButtonNewPlayer';
import { CardPlayer } from '@components/cards/CardPlayer';
import { usePlayers } from '@hooks';

export default function ListPlayers() {
  const [players] = usePlayers();

  const sortedPlayed = players.toSorted((a, b) => {
    if (a.isArchived === b.isArchived) {
      return a.name.localeCompare(b.name);
    }
    return a.isArchived ? 1 : -1;
  });

  return (
    <main className="mx-auto grid max-w-[800px] grid-cols-3 gap-2 p-4">
      {sortedPlayed.map((player) => (
        <CardPlayer
          key={player.idPlayer}
          {...player}
          href={`/players/edit?id=${player.idPlayer}`}
          showFavorite
        />
      ))}

      <ButtonNewPlayer />
    </main>
  );
}
