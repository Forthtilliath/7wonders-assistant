import { useParamsInt } from '@/hooks/useParamsInt';

export function GameHistory() {
  const { idGame } = useParamsInt('idGame');

  return <>GameHistory : {idGame}</>;
}
