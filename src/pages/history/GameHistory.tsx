import { useRef } from 'react';
import { useLoaderData } from 'react-router-dom';
import type { GameHistoriesComplete } from '@types';
import { HeaderOptions, Section } from '@components/layout';
import { ButtonIcon } from '@components/shared';
import { FaDownload, FaImage } from '@components/shared/Icons';
import { Badge } from '@components/ui/Badge';
import { useSave } from '@hooks';
import { TableScores } from '@/components/charts/TableScores';
import { ChartPie } from '@/components/charts/ChartPie';

export function GameHistory() {
  const data = useLoaderData() as GameHistoriesComplete;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { idGame, createdAt, ...extensions } = data.game;
  const sectionRef = useRef<HTMLDivElement>(null);
  const { download, saveAsImage } = useSave();

  return (
    <main>
      <HeaderOptions>
        <ButtonIcon
          icon={FaDownload}
          aria-label="Download As File"
          onClick={() => download(data, 'game.json')}
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

        <div className="flex justify-center flex-col py-4 gap-4" ref={sectionRef}>
          <TableScores data={data} />

          {data.scores.map((score) => (
            <ChartPie
              key={"pie" + score.idPlayer}
              data={[score.military, score.civilians, score.commercials, score.scientifics, score.guilds, score.treasury]}
              labels={['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange']}
            />
          ))}
        </div>
      </Section>
    </main>
  );
}
