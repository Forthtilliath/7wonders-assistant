import { useParams } from 'react-router-dom';

export function GameHistory() {
  const { idGame } = useParams();

  return <>GameHistory : {idGame}</>;
}
