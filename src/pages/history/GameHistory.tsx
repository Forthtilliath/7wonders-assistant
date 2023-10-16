import { PropsWithChildren, useRef } from 'react';
import { useLoaderData } from 'react-router-dom';
import html2canvas from 'html2canvas';
import type { GameHistoriesComplete } from '@types';
import { HeaderOptions, Section } from '@components/layout';
import { ButtonIcon } from '@components/shared';
import { FaDownload, FaImage } from '@components/shared/Icons';
import { CardPlayer } from '@components/cards';
import { Badge } from '@components/ui/Badge';
import { assertsIsDefined, cn } from '@helpers';
import { useHorizontalScroll } from '@hooks';

export function GameHistory() {
  const { game, scores } = useLoaderData() as GameHistoriesComplete;
  const ref = useHorizontalScroll<HTMLDivElement>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { idGame, createdAt, ...extensions } = game;
  const sectionRef = useRef<HTMLDivElement>(null);

  const download = () => {
    try {
      const data = { game, scores };
      const json = JSON.stringify(data);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'partie.json';

      if (typeof link.download === 'undefined') {
        // Fallback for browsers that do not support the download attribute
        window.open(url);
      } else {
        link.click();
      }

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error during JSON.stringify:', error);
      // Handle the error or show an error message to the user
    }
  };

  const saveAsImage = () => {
    assertsIsDefined(sectionRef.current);

    const options = {
      backgroundColor: '#1d1e22',
    };

    html2canvas(sectionRef.current, options).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');

      link.href = imgData;
      link.download = 'image.png';
      link.click();
    });
  };

  return (
    <main>
      <HeaderOptions>
        <ButtonIcon
          icon={FaDownload}
          aria-label="Download As File"
          onClick={download}
        />
        <ButtonIcon
          icon={FaImage}
          aria-label="Download As Image"
          onClick={saveAsImage}
        />
      </HeaderOptions>

      <Section>
        <div className="text-center">
          {Object.entries(extensions).map(
            ([extension, active]) =>
              active && <Badge key={extension} label={extension} />
          )}
        </div>

        <div className="flex justify-center py-4" ref={sectionRef}>
          <ColumnLabels>
            <Cell className="h-16">&nbsp;</Cell>
            <Cell className="bg-red-500/70">Military</Cell>
            <Cell className="bg-yellow-500/70">Treasury</Cell>
            <Cell className="bg-stone-500/70">Wonders</Cell>
            <Cell className="bg-blue-500/70">Civilians</Cell>
            <Cell className="bg-yellow-500/70">Commercials</Cell>
            <Cell className="bg-green-500/70">Scientifics</Cell>
            <Cell className="bg-purple-500/70">Guilds</Cell>
            {extensions.Armada && (
              <Cell className="bg-cyan-500/70">Armada</Cell>
            )}
            {extensions.Leaders && (
              <Cell className="bg-slate-200/70">Leaders</Cell>
            )}
            {extensions.Cities && (
              <Cell className="bg-slate-800/70">Cities</Cell>
            )}
            <Cell className="bg-orange-500/70">Total</Cell>
          </ColumnLabels>

          <div className="flex overflow-x-auto" ref={ref}>
            {scores.map((score) => (
              <Column key={score.idPlayer}>
                <Cell className="h-16 w-auto">
                  <CardPlayer
                    {...score.player}
                    className="aspect-square h-full"
                    classNameH2="text-xs font-normal"
                  />
                </Cell>
                <Cell className="bg-red-500/70">{score.military}</Cell>
                <Cell className="bg-yellow-500/70">{score.treasury}</Cell>
                <Cell className="bg-stone-500/70">{score.wonders}</Cell>
                <Cell className="bg-blue-500/70">{score.civilians}</Cell>
                <Cell className="bg-yellow-500/70">{score.commercials}</Cell>
                <Cell className="bg-green-500/70">{score.scientifics}</Cell>
                <Cell className="bg-purple-500/70">{score.guilds}</Cell>
                {extensions.Armada && (
                  <Cell className="bg-cyan-500/70">{score.armada}</Cell>
                )}
                {extensions.Leaders && (
                  <Cell className="bg-slate-200/70">{score.leaders}</Cell>
                )}
                {extensions.Cities && (
                  <Cell className="bg-slate-800/70">{score.cities}</Cell>
                )}
                <Cell className="bg-orange-500/70">{score.total}</Cell>
              </Column>
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}

function Cell({ children, className }: PropsWithChildren<PropsWithClassname>) {
  return (
    <div
      className={cn(
        'flex h-12 w-full items-center justify-center p-2',
        className
      )}>
      {children}
    </div>
  );
}

function ColumnLabels({ children }: PropsWithChildren) {
  return (
    <div className="flex w-[100px] min-w-[100px] flex-col justify-center self-start">
      {children}
    </div>
  );
}

function Column({ children }: PropsWithChildren) {
  return (
    <div className="min-w-16 flex w-16 flex-col items-center justify-center odd:rounded-t odd:bg-white/10">
      {children}
    </div>
  );
}
