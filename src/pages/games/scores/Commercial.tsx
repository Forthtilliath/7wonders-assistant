import { CardPlayerInGame } from '@/components/cards/CardPlayerInGame';
import { useGameStore } from '@/lib/gameStore';

export function Commercial() {
  const players = useGameStore((s) => s.players);

  return (
    <div className="flex flex-col gap-4 py-6 px-10">
      {players.map((player) => (
        <div key={player.id} className="flex items-center gap-8">
          <CardPlayerInGame {...player} className="w-[100px]" />
          <input
            id="commerce"
            type="number"
            defaultValue={0}
            className="border-wonders-dark w-full rounded border-2 bg-slate-900 p-3 text-center"
          />
        </div>
      ))}
    </div>
  );
}