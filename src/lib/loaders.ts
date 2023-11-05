import { getGameHistory } from '@lib';

export async function loaderGameHistory({ params }: LoaderParams<'idGame'>) {
  if (!params.idGame) {
    throw new Error('Game history not found');
  }
  const idGame = parseInt(params.idGame, 10);
  return await getGameHistory(idGame);
}