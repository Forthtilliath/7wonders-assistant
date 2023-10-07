import { CATEGORIES } from '@/data/app';
import { useGameStore } from '@/lib/gameStore';

import { CardPlayerInGame } from '../cards/CardPlayerInGame';
import { DropdownScience } from './DropdownScience';

type Props = {
  step: (typeof CATEGORIES)[number];
};

export function GroupScoreInputs({ step }: Props) {
  const { players, scores, setScore } = useGameStore();

  const saveScore: SaveScoreEventHandler = (idPlayer: string) => (e) =>
    setScore(step, idPlayer, e.currentTarget.valueAsNumber);

  return (
    <div className="flex flex-col gap-4 px-10 py-6">
      {players.map((player) => (
        <div key={player.id} className="flex items-center gap-8">
          <CardPlayerInGame {...player} className="w-[100px]" />
          <input
            type="number"
            defaultValue={scores[step][player.id] ?? 0}
            onChange={saveScore(player.id)}
            className="border-wonders-dark w-full rounded border-2 bg-slate-900 p-3 text-center"
          />
          {step === 'scientifics' && <DropdownScience />}
          {/* Ouvrir les sciences inputs ici, dans une div */}
        </div>
      ))}
    </div>
  );
}
