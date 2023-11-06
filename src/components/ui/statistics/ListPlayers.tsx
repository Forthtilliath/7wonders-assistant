import { useTranslation } from 'react-i18next';
import { Player } from '@/@types';
import { TablePlayersWinRate } from '@/components/charts/TablePlayersWinRate';

type Props = {
  players: Player[];
};
export function ListPlayers({ players }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'statistics' });

  console.log(players)
  return (
    <>
      <h2>{t('players')}</h2>
      <TablePlayersWinRate players={players} />
    </>
  );
}
