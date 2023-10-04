import { CardPlayer } from '@/components/cards/CardPlayer';
import { FaPlus } from '@/components/shared/Icons';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Link } from 'react-router-dom';

const testValues: Player[] = [
  {
    id: '349a799f-a55d-44b3-1efa-e309e77d67ec',
    name: 'Mike',
    isFavorite: 'true',
    avatar: '/assets/images/logo-mike.png',
  },
  {
    id: 'efbedc67-2ae7-4b4d-0980-ca7d7b858bd2',
    name: 'Forth',
    isFavorite: 'false',
    avatar: '/assets/images/logo-forth.png',
  },
];

export default function ListPlayers() {
  const [players] = useLocalStorage<Player[]>('players', testValues);

  return (
    <main className="mx-auto grid max-w-[800px] grid-cols-3 gap-2 p-4">
      {players.map((player) => (
        <CardPlayer key={player.id} {...player} />
      ))}

      <Link
        to="/players/new"
        className="flex aspect-square h-auto max-w-[250px] items-center justify-center rounded bg-slate-700">
        <FaPlus size={'5rem'} />
      </Link>
    </main>
  );
}