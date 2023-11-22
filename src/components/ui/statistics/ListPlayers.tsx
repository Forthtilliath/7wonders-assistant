import { useTranslation } from 'react-i18next';
import { TablePlayersWinRate } from '@/components/charts/TablePlayersWinRate';

export function ListPlayers() {
  const { t } = useTranslation(undefined, { keyPrefix: 'statistics' });

  return (
    <>
      <h2>{t('players')}</h2>
      <TablePlayersWinRate />
    </>
  );
}
