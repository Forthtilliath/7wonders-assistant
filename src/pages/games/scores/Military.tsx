import { useNavigate } from 'react-router-dom';

import { CardPlayerInGame } from '@/components/cards/CardPlayerInGame';
import { HeaderOptions } from '@/components/layout/HeaderOptions';
import { ButtonIcon } from '@/components/shared/ButtonIcon';
import { AiOutlineArrowRight } from '@/components/shared/Icons';
import { useGameStore } from '@/lib/gameStore';

export function Military() {
  const navigate = useNavigate();
  const { players, scores, setScore } = useGameStore();

  const nextStep = () => navigate('/scores/treasury');

  const saveScore: SaveScoreEventHandler = (idPlayer: string) => (e) =>
    setScore('military', idPlayer, e.currentTarget.valueAsNumber);

  return (
    <section>
      <HeaderOptions>
        <ButtonIcon
          icon={AiOutlineArrowRight}
          onClick={nextStep}
          className="text-white"
        />
      </HeaderOptions>
      <div className="flex flex-col gap-4 px-10 py-6">
        {players.map((player) => (
          <div key={player.id} className="flex items-center gap-8">
            <CardPlayerInGame {...player} className="w-[100px]" />
            <input
              type="number"
              defaultValue={scores['military'][player.id] ?? 0}
              onChange={saveScore(player.id)}
              className="border-wonders-dark w-full rounded border-2 bg-slate-900 p-3 text-center"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
