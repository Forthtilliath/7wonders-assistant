import { useRef } from 'react';
import { useLoaderData } from 'react-router-dom';
import type { GameHistoriesComplete } from '@types';
import { HeaderOptions, Section } from '@components/layout';
import { ButtonIcon } from '@components/shared';
import { FaDownload, FaImage } from '@components/shared/Icons';
import { PieScorePlayer } from '@components/charts/PieScorePlayer';
import { TableScores } from '@components/charts/TableScores';
import { Badge } from '@components/ui/Badge';
import { filterKeys } from '@helpers';
import { useSave } from '@hooks';
import { CATEGORIES } from '@constants';

export function GameHistory() {
  const data = useLoaderData() as GameHistoriesComplete;
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
          {data.game.extensions.map((extension) => (
            <Badge key={extension} label={extension} />
          ))}
        </div>

        <div
          className="mb-8 flex flex-col justify-center gap-5 py-4"
          ref={sectionRef}>
          <TableScores data={data} />

          {data.scores.map((scores) => (
            <div key={'pie' + scores.idPlayer}>
              <h2 className="mb-4 text-center">{scores.player.name}</h2>
              <PieScorePlayer
                scores={filterKeys(scores, [...CATEGORIES])}
                extensions={data.game.extensions}
              />
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
