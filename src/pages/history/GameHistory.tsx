import { useRef } from 'react';
import { useLoaderData } from 'react-router-dom';
import { PieScorePlayer } from '@/components/charts/PieScorePlayer';
import { TableScores } from '@/components/charts/TableScores';
import { CATEGORIES } from '@/constants';
import { filterKeys } from '@/helpers/object';
import type { GameHistoriesComplete } from '@types';
import { HeaderOptions, Section } from '@components/layout';
import { ButtonIcon } from '@components/shared';
import { FaDownload, FaImage } from '@components/shared/Icons';
import { Badge } from '@components/ui/Badge';
import { useSave } from '@hooks';

export function GameHistory() {
  const data = useLoaderData() as GameHistoriesComplete;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { idGame, createdAt, ...extensions } = data.game;
  const sectionRef = useRef<HTMLDivElement>(null);
  const { downloadAsJson, saveAsImage } = useSave();

  return (
    <main>
      <HeaderOptions>
        <ButtonIcon
          icon={FaDownload}
          aria-label="Download As File"
          onClick={() => downloadAsJson(data, 'game.json')}
        />
        <ButtonIcon
          icon={FaImage}
          aria-label="Download As Image"
          onClick={() => saveAsImage(sectionRef.current, 'game.png')}
        />
      </HeaderOptions>

      <Section>
        <div className="text-center">
          {Object.entries(extensions).map(
            ([extension, active]) =>
              active && <Badge key={extension} label={extension} />
          )}
        </div>

        <div
          className="flex flex-col justify-center gap-4 py-4"
          ref={sectionRef}>
          <TableScores data={data} />

          {data.scores.map((scores) => (
            <PieScorePlayer
              key={'pie' + scores.idPlayer}
              scores={filterKeys(scores, [...CATEGORIES])}
              extensions={Object.entries(extensions)
                .filter(([, v]) => v)
                .map(([k]) => k)}
            />
          ))}
        </div>
      </Section>
    </main>
  );
}
