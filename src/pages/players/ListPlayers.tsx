import { CardNewPlayer } from '@/components/cards/CardNewPlayer';
import { CardPlayer } from '@/components/cards/CardPlayer';
import { usePlayers } from '@/hooks/usePlayers';

export default function ListPlayers() {
  const [players] = usePlayers();

  return (
    <main className="mx-auto grid max-w-[800px] grid-cols-3 gap-2 p-4">
      {players.map((player) => (
        <CardPlayer key={player.id} {...player} />
      ))}

      <CardNewPlayer />
    </main>
  );
}
