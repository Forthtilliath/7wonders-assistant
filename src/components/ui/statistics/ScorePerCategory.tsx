import { ComponentPropsWithoutRef, useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PieScorePlayer } from '@/components/charts';
import { getLocalStorage } from '@/helpers';
import { GameHistoriesComplete, Scores } from '@types';
import { EXTENSIONS, LS_KEY } from '@constants';

type Props = {
  games: GameHistoriesComplete[];
};

export function ScorePerCategory({ games }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'statistics' });
  const extensionsStorage = getLocalStorage<Extension[]>(LS_KEY.extensions, []);
  const [extensions, setExtensions] = useState<Extension[]>(extensionsStorage);

    const gamesScores = useMemo(() => games
      .filter(
        ({ game }) =>
          game.extensions.every((ext) => extensions.includes(ext)) &&
          game.extensions.length === extensions.length
      )
      .flatMap(({ scores }) =>
        scores.map(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ player, ranking, total, idPlayer, idGame, ...scores }) => scores
        )
      )
      .reduce((acc, score: Scores) => {
        let categ: keyof Scores;
        for (categ in score) {
          acc[categ] = (acc[categ] ?? 0) + score[categ]!;
        }
        return acc;
      }, {} as Scores), [extensions, games]);

  const handleChangeExtensions: InputChangeEventHandler = (e) => {
    const ext = e.currentTarget.name as Extension;
    if (e.currentTarget.checked) {
      setExtensions((s) => [...s, ext]);
    } else {
      setExtensions((s) => s.filter((ss) => ext !== ss));
    }
  };

  return (
    <>
      <h2>{t('avg_score_per_categ')}</h2>
      <form>
        <ul className="grid w-full grid-cols-3 gap-2 min-[420px]:grid-cols-4 min-[520px]:grid-cols-5">
          {EXTENSIONS.map((extension) => (
            <Extension
              key={extension}
              name={extension}
              value={extension}
              onChange={handleChangeExtensions}
              checked={extensions.includes(extension)}
            />
          ))}
        </ul>
      </form>

      <PieScorePlayer scores={gamesScores} extensions={extensions} />
    </>
  );
}

function Extension(inputProps: ComponentPropsWithoutRef<'input'>) {
  const id = useId();
  return (
    <li>
      <input type="checkbox" className="peer hidden" {...inputProps} id={id} />
      <label
        htmlFor={id}
        className="inline-flex w-full cursor-pointer rounded-lg border-2 border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-600 peer-checked:border-blue-600 peer-checked:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:peer-checked:text-gray-300">
        <p className="w-full truncate text-center text-lg font-semibold">
          {inputProps.value}
        </p>
      </label>
    </li>
  );
}
