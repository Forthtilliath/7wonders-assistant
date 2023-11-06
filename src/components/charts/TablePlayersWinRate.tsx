import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Player } from '@types';

type Props = {
  players: Player[];
};

export function TablePlayersWinRate({ players }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'statistics' });

  /**
   * TODO :
   * - [ ] Récupérer les parties
   * - [ ] Les rassembler par joueur
   * - [ ] Compter le nombre de parties que chaque joueur a fini premier
   * - [ ] Compter le nombre de parties que chaque joueur a joué
   */

  return (
    <div className="grid grid-cols-4">
      <div className="col-span-2">{t('name')}</div>
      <div>{t('win_rate')}</div>
      <div>{t('games')}</div>

      {players.map((player) => (
        <React.Fragment key={player.idPlayer}>
          <div></div>
          <div>{player.name}</div>
          <div>15%</div>
          <div>15</div>
        </React.Fragment>
      ))}
    </div>
  );
}
