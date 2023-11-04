import { useState } from 'react';
import {
  addValueIntoMax,
  addValueIntoMin,
  assertsIsDefined,
  cn,
  countScienceScore,
} from '@/helpers';
import { useRefs } from '@/hooks/useRefs';
import { CardPlayer } from '@components/cards';
import { useGameStore } from '@lib';
import { CATEGORIES } from '@constants';
import { ButtonToggleIcon } from '../shared';
import {
  BsFillFileArrowDownFill,
  BsFillFileArrowUpFill,
} from '../shared/Icons';
import { DropdownScience } from './DropdownScience';

type Props = {
  step: (typeof CATEGORIES)[number];
};

//wheel, tablet, compass
type Science = 'wheel' | 'tablet' | 'compass' | 'all';
type Science2 = 'wheel' | 'tablet' | 'compass' | 'most' | 'all';

const SCORE_TRIPLET = 7;

export function GroupScoreInputs({ step }: Props) {
  const players = useGameStore((s) => s.players);
  const scores = useGameStore((s) => s.scores);
  const setScore = useGameStore((s) => s.setScore);

  const [panelIndexOpen, setPanelIndexOpen] = useState<number>(-1);
  const [refsByKey, setRef] = useRefs<HTMLInputElement>();

  const saveScore: SaveScoreEventHandler = (idPlayer) => (e) =>
    setScore(step, idPlayer, e.currentTarget.valueAsNumber);

  const calculateScoreSolo = ({
    wheel,
    tablet,
    compass,
    all,
  }: Record<Science, number>) => {
    [wheel, tablet, compass] = addValueIntoMax([wheel, tablet, compass], all);

    return countScienceScore(wheel, tablet, compass, SCORE_TRIPLET);
  };

  const calculateScoreTriplet = ({
    wheel,
    tablet,
    compass,
    all,
  }: Record<Science, number>) => {
    while (all > 0) {
      [wheel, tablet, compass] = addValueIntoMin([wheel, tablet, compass], 1);
      all--;
    }

    return countScienceScore(wheel, tablet, compass, SCORE_TRIPLET);
  };

  const calculateScores = ({
    wheel,
    tablet,
    compass,
    most,
    all,
  }: Record<Science2, string>) => {
    let iWheel = parseInt(wheel, 10);
    let iTablet = parseInt(tablet, 10);
    let iCompass = parseInt(compass, 10);

    const iMost = parseInt(most, 10);

    [iWheel, iTablet, iCompass] = addValueIntoMax(
      [iWheel, iTablet, iCompass],
      iMost
    );

    const iAll = parseInt(all, 10);

    const scoreBySolo = calculateScoreSolo({
      wheel: iWheel,
      tablet: iTablet,
      compass: iCompass,
      all: iAll,
    });

    const scoreByTriplet = calculateScoreTriplet({
      wheel: iWheel,
      tablet: iTablet,
      compass: iCompass,
      all: iAll,
    });

    return Math.max(scoreBySolo, scoreByTriplet);
  };

  const handleSubmit: (iPlayer: number) => FormSubmitEventHandler =
    (iPlayer: number) => (e) => {
      e.preventDefault();
      const sciencesObj = Object.fromEntries(new FormData(e.currentTarget));

      const bestScore = calculateScores(
        sciencesObj as Record<Science2, string>
      );
      console.log({ bestScore });

      const input = refsByKey[iPlayer];
      assertsIsDefined(input);
      input.valueAsNumber = bestScore;
      setScore(step, players[iPlayer].idPlayer, bestScore);
    };

  return (
    <div className="flex flex-col gap-4 px-10 py-6">
      {players.map((player, i) => (
        <form key={player.idPlayer} onSubmit={handleSubmit(i)}>
          <div className="flex items-center gap-8">
            <CardPlayer
              {...player}
              className="w-[100px]"
              classNameH2="text-xs font-normal"
            />
            <input
              ref={setRef(i)}
              type="number"
              // name="score"
              defaultValue={scores[player.idPlayer]?.[step] ?? 0}
              onChange={saveScore(player.idPlayer)}
              className="border-wonders-dark w-full rounded border-2 bg-slate-900 p-3 text-center disabled:border-slate-700"
              disabled={panelIndexOpen === i}
            />
            {step === 'scientifics' && (
              <ButtonToggleIcon
                condition={panelIndexOpen === i}
                icons={[BsFillFileArrowDownFill, BsFillFileArrowUpFill]}
                // onClick={handleToggleDropdown(i)}
                onClick={() => setPanelIndexOpen((v) => (v !== i ? i : -1))}
                className={cn('m-0 text-slate-200', {
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
