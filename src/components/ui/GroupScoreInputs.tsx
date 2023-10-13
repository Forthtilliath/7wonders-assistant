import { CardPlayer } from '@components/cards';
import { DropdownScience } from '@components/ui';
import { useGameStore } from '@lib';
import { CATEGORIES } from '@constants';

type Props = {
  step: (typeof CATEGORIES)[number];
};

export function GroupScoreInputs({ step }: Props) {
  const { players, scores, setScore } = useGameStore();

  const saveScore: SaveScoreEventHandler = (idPlayer) => (e) =>
    setScore(step, idPlayer, e.currentTarget.valueAsNumber);

  return (
    <div className="flex flex-col gap-4 px-10 py-6">
      {players.map((player) => (
        <div key={player.idPlayer} className="flex items-center gap-8">
          <CardPlayer
            {...player}
            className="w-[100px]"
            classNameH2="text-xs font-normal"
          />
          <input
            type="number"
            defaultValue={scores[player.idPlayer]?.[step] ?? 0}
            onChange={saveScore(player.idPlayer)}
            className="border-wonders-dark w-full rounded border-2 bg-slate-900 p-3 text-center"
          />
          {step === 'scientifics' && <DropdownScience />}
          {/* Ouvrir les sciences inputs ici, dans une div */}
        </div>
      ))}
    </div>
  );
}
