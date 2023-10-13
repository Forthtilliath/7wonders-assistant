import { useLoaderData } from 'react-router-dom';
import { HeaderOptions } from '@components/layout/HeaderOptions';
import { ButtonIcon } from '@components/shared';
import type { GameHistoriesComplete, GameHistory } from '@types';
import { CardPlayer } from '@/components/cards';
import { PropsWithChildren } from 'react';
import { cn } from '@/helpers';

export function GameHistory() {
  const {game, scores} = useLoaderData() as GameHistoriesComplete;
  
  return (
    <main className="">
      <HeaderOptions>
        <ButtonIcon icon={() => <></>} aria-label="" />
      </HeaderOptions>

      <pre>
        {JSON.stringify(game, null, 2)}
      </pre>

      <section className='p-4'>
        <div className="flex">
          <ColumnHeader>
            <Cell className='h-16'>&nbsp;</Cell>
            <Cell className='bg-red-500/70'>Military</Cell>
            <Cell className='bg-yellow-500/70'>Treasury</Cell>
            <Cell className='bg-stone-500/70'>Wonders</Cell>
            <Cell className='bg-blue-500/70'>Civilians</Cell>
            <Cell className='bg-green-500/70'>Scientifics</Cell>
            <Cell className='bg-yellow-500/70'>Commercials</Cell>
            <Cell className='bg-purple-500/70'>Guilds</Cell>
            <Cell className='bg-cyan-500/70'>Armada</Cell>
            <Cell className='bg-slate-200/70'>Leaders</Cell>
            <Cell className='bg-slate-800/70'>Cities</Cell>
            <Cell className='bg-orange-500/70'>Total</Cell>
          </ColumnHeader>
          <div className='flex overflow-x-auto '>
            {scores.map(score => (
              <Column key={score.idPlayer}>
                <Cell className='h-16 w-auto'>
                  <CardPlayer {...score.player}  className='aspect-square h-full' classNameH2='text-xs font-normal' />
                </Cell>
                <Cell className='bg-red-500/70'>{score.military}</Cell>
                <Cell className='bg-yellow-500/70'>{score.treasury}</Cell>
                <Cell className='bg-stone-500/70'>{score.wonders}</Cell>
                <Cell className='bg-blue-500/70'>{score.civilians}</Cell>
                <Cell className='bg-green-500/70'>{score.scientifics}</Cell>
                <Cell className='bg-yellow-500/70'>{score.commercials}</Cell>
                <Cell className='bg-purple-500/70'>{score.guilds}</Cell>
                <Cell className='bg-cyan-500/70'>{score.armada}</Cell>
                <Cell className='bg-slate-200/70'>{score.leaders}</Cell>
                <Cell className='bg-slate-800/70'>{score.cities}</Cell>
                <Cell className='bg-orange-500/70'>{score.total}</Cell>
              </Column>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Cell({children,className}: PropsWithChildren<PropsWithClassname>) {
  return <div className={cn('h-12 w-full flex items-center justify-center p-2',className)}>{children}</div>
}

function ColumnHeader({ children }: PropsWithChildren) {
  return <div className="w-[100px] flex flex-col justify-center">{children}</div>
}

function Column({ children }: PropsWithChildren) {
  return <div className="w-[100px] flex flex-col items-center justify-center odd:bg-white/10">{children}</div>
}