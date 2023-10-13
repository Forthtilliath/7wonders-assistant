import { useLoaderData } from 'react-router-dom';
import { HeaderOptions } from '@components/layout/HeaderOptions';
import { ButtonIcon } from '@components/shared';
import type { GameHistory } from '@types';

export function GameHistory() {
  const scores = useLoaderData() as GameHistory[];
  /**
   * {
   *   game: {
   *     leader: true,
   *     cities: false,
   *   },
   *   gameHistory: [{
   *     ...gameHistory,
   *     player: {
   *       id,
   *       avatar,
   *       name
   *     }
   *   }],
   * }
   */

  // Get player infos
  // Get game infos
  
  return (
    <main className="">
      <HeaderOptions>
        <ButtonIcon icon={() => <></>} aria-label="" />
      </HeaderOptions>

      {/* Score des joueurs */}
      <section className='p-4'>
        <div className="flex gap-4">
          <div className="p-2 w-[100px] flex flex-col justify-center">
            <div>&nbsp;</div>
            <div>Military</div>
            <div>Treasury</div>
            <div>Wonders</div>
            <div>Civilians</div>
            <div>Scientifics</div>
            <div>Commercials</div>
            <div>Guilds</div>
            <div>Armada</div>
            <div>Leaders</div>
            <div>Cities</div>
            <div>Total</div>
          </div>
          <div className='flex gap-4 overflow-x-auto '>
          {scores.map(score => (
          <div key={score.idPlayer} className="w-[100px] flex flex-col items-center justify-center">
            <div>Avatar</div>
              <div>{score.military}</div>
              <div>{score.treasury}</div>
              <div>{score.wonders}</div>
              <div>{score.civilians}</div>
              <div>{score.scientifics}</div>
              <div>{score.commercials}</div>
              <div>{score.guilds}</div>
              <div>{score.armada}</div>
              <div>{score.leaders}</div>
              <div>{score.cities}</div>
              <div>{score.total}</div>
          </div>
          ))}</div>
        </div>
      </section>
    </main>
  );
}
