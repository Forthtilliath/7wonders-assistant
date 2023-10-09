import { ButtonNewPlayer } from '@/components/cards/ButtonNewPlayer';
import { CardPlayer } from '@/components/cards/CardPlayer';
import { usePlayers } from '@/hooks/usePlayers';

export default function ListPlayers() {
  const [players] = usePlayers();

  players.sort((a, b) => {
    if (a.isArchived === b.isArchived) {
      return a.name.localeCompare(b.name);
    }
    return a.isArchived === 'true' ? 1 : -1;
  });

  return (
    <main className="mx-auto grid max-w-[800px] grid-cols-3 gap-2 p-4">
      {players.map((player) => (
        <CardPlayer key={player.id} {...player} />
      ))}

      <ButtonNewPlayer />
    </main>
  );
}
