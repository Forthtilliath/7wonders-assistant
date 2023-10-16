import { GameHistoriesComplete } from '@types';
import { CardPlayer } from '@components/cards';
import { useHorizontalScroll } from '@hooks';
import { Cell, Column, ColumnLabels } from './table';

type Props = { data: GameHistoriesComplete };

export function TableScores({ data: { game, scores } }: Props) {
  const ref = useHorizontalScroll<HTMLDivElement>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { idGame, createdAt, ...extensions } = game;

  return (
    <div className='flex justify-center'>
      <ColumnLabels>
        <Cell className="h-16">&nbsp;</Cell>
        <Cell className="bg-red-500/70">Military</Cell>
        <Cell className="bg-yellow-500/70">Treasury</Cell>
        <Cell className="bg-stone-500/70">Wonders</Cell>
        <Cell className="bg-blue-500/70">Civilians</Cell>
        <Cell className="bg-yellow-500/70">Commercials</Cell>
        <Cell className="bg-green-500/70">Scientifics</Cell>
        <Cell className="bg-purple-500/70">Guilds</Cell>
        {extensions.Armada && <Cell className="bg-cyan-500/70">Armada</Cell>}
        {extensions.Leaders && <Cell className="bg-slate-200/70">Leaders</Cell>}
        {extensions.Cities && <Cell className="bg-slate-800/70">Cities</Cell>}
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
  );
}
