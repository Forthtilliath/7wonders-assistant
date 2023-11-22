import { useState } from 'react';
import { useRefs } from '@/hooks/useRefs';
import { calculateScores, ScienceSymbol } from '@lib/utils/scores';
import { CardPlayer } from '@components/cards';
import { assertsIsDefined, cn } from '@helpers';
import { useGameStore } from '@lib';
import { CATEGORIES } from '@constants';
import { ButtonToggleIcon } from '../shared';
import {
  BsFillFileArrowDownFill,
  BsFillFileArrowUpFill,
} from '../shared/Icons';
import { DropdownScience } from './DropdownScience';
import { ScoreInput } from './inputs/ScoreInput';

type Props = {
  step: (typeof CATEGORIES)[number];
};

const DROPDOWN_CLOSED = -1;

export function GroupScoreInputs({ step }: Props) {
  const players = useGameStore((s) => s.players);
  const scores = useGameStore((s) => s.scores);
  const setScore = useGameStore((s) => s.setScore);

  const [panelIndexOpen, setPanelIndexOpen] = useState<number>(DROPDOWN_CLOSED);
  const [refsByKey, setRef] = useRefs<HTMLInputElement>();

  const saveScore = (idPlayer: number) => (newScore: number) => {
    setScore(step, idPlayer, newScore);
  };

  const handleSubmit: (iPlayer: number) => FormSubmitEventHandler =
    (iPlayer: number) => (e) => {
      e.preventDefault();
      const sciencesObj = Object.fromEntries(new FormData(e.currentTarget));

      const bestScore = calculateScores(
        sciencesObj as Record<ScienceSymbol, string>
      );

      const input = refsByKey[iPlayer];
      assertsIsDefined(input);
      input.valueAsNumber = bestScore;
      setScore(step, players[iPlayer].idPlayer, bestScore);
    };

  return (
    <div className="flex flex-col gap-4 px-10 py-6">
      {players.map((player, i) => (
        <form key={player.idPlayer} onSubmit={handleSubmit(i)}>
          <div className="grid h-[50px] grid-cols-[50px_1fr_30px] items-center gap-3 sm:gap-8">
            <CardPlayer
              {...player}
              className=""
              classNameH2="text-xs font-normal"
            />
            <ScoreInput
              key={player.idPlayer}
              ref={setRef(i)}
              value={scores[player.idPlayer]?.[step] ?? 0}
              setValue={saveScore(player.idPlayer)}
              disabled={panelIndexOpen !== DROPDOWN_CLOSED}
              min={0}
            />

            {step === 'scientifics' && (
              <ButtonToggleIcon
                condition={panelIndexOpen === i}
                icons={[BsFillFileArrowDownFill, BsFillFileArrowUpFill]}
                onClick={() => setPanelIndexOpen((v) => (v !== i ? i : -1))}
                className={cn('m-0 flex text-slate-200', {
                  'text-green-500': panelIndexOpen === i,
                })}
                type={panelIndexOpen === i ? 'submit' : 'button'}
                size="2rem">
                <span className="sr-only">
                  {panelIndexOpen === i ? 'Close the box' : 'Open the box'}
                </span>
              </ButtonToggleIcon>
            )}
          </div>
          {step === 'scientifics' && (
            <DropdownScience open={panelIndexOpen === i} />
          )}
        </form>
      ))}
    </div>
  );
}
