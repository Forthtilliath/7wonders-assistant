import { CardNewPlayer } from '@/components/cards/CardNewPlayer';
import { CardPlayer } from '@/components/cards/CardPlayer';
import { usePlayers } from '@/hooks/usePlayers';


export default function ListPlayers() {
  const [players] = usePlayers();
  players.sort((a, b) => {
    if (a.isArchived === b.isArchived) {
      console.log(a.name,a.isArchived, b.name,b.isArchived, a.name.localeCompare(b.name))
      return a.name.localeCompare(b.name);
    }
    console.log(a.name,a.isArchived, b.name,b.isArchived, a.name.localeCompare(b.name))
    return a.isArchived === 'true' ? 1 : -1;
  });

  console.log(players)

  return (
    <main className="mx-auto grid max-w-[800px] grid-cols-3 gap-2 p-4">
      {players.map((player) => (
        <CardPlayer key={player.id} {...player} />
      ))}

      <CardNewPlayer />
    </main>
  );
}