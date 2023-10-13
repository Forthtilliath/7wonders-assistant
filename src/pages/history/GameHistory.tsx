import { PropsWithChildren } from 'react';
import { useLoaderData } from 'react-router-dom';
import type { GameHistoriesComplete } from '@types';
import { HeaderOptions } from '@components/layout/HeaderOptions';
import { ButtonIcon } from '@components/shared';
import { CardPlayer } from '@components/cards';
import { Badge } from '@components/ui/Badge';
import { cn } from '@helpers';
import { useHorizontalScroll } from '@hooks';

export function GameHistory() {
  const { game, scores } = useLoaderData() as GameHistoriesComplete;
  const ref = useHorizontalScroll<HTMLDivElement>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...extensions } = game;
  {
    Object.entries(extensions).map(([extension, active]) =>
      active ? <Badge label={extension} /> : null
    );
  }

  return (
    <main className="p-4 text-center">
      <HeaderOptions>
        <ButtonIcon icon={() => <></>} aria-label="" />
      </HeaderOptions>

      {Object.entries(extensions).map(
        ([extension, active]) =>
          active && <Badge key={extension} label={extension} />
      )}

      <section className="pt-4">
        <div className="flex justify-center">
          <ColumnLabels>
            <Cell className="h-16">&nbsp;</Cell>
            <Cell className="bg-red-500/70">Military</Cell>
            <Cell className="bg-yellow-500/70">Treasury</Cell>
            <Cell className="bg-stone-500/70">Wonders</Cell>
            <Cell className="bg-blue-500/70">Civilians</Cell>
            <Cell className="bg-green-500/70">Scientifics</Cell>
            <Cell className="bg-yellow-500/70">Commercials</Cell>
            <Cell className="bg-purple-500/70">Guilds</Cell>
            <Cell className="bg-cyan-500/70">Armada</Cell>
            <Cell className="bg-slate-200/70">Leaders</Cell>
            <Cell className="bg-slate-800/70">Cities</Cell>
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
                <Cell className="bg-green-500/70">{score.scientifics}</Cell>
                <Cell className="bg-yellow-500/70">{score.commercials}</Cell>
                <Cell className="bg-purple-500/70">{score.guilds}</Cell>
                <Cell className="bg-cyan-500/70">{score.armada}</Cell>
                <Cell className="bg-slate-200/70">{score.leaders}</Cell>
                <Cell className="bg-slate-800/70">{score.cities}</Cell>
                <Cell className="bg-orange-500/70">{score.total}</Cell>
              </Column>
            ))}
          </div>
        </div>
      </section>
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
    <div className="flex w-16 min-w-16 flex-col items-center justify-center odd:rounded-t odd:bg-white/10">
      {children}
    </div>
  );
}
