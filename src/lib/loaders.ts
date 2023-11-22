import { getGameHistory, getGames, getPlayer, getPlayers } from '@lib';

export function loaderGameHistory({ params }: LoaderParams<'idGame'>) {
  if (!params.idGame) {
    throw new Error('Game history not found');
  }
  const idGame = parseInt(params.idGame, 10);
  return getGameHistory(idGame);
}

export function loaderGames() {
  return getGames();
}

export async function loaderStatistics() {
  const games = await getGames();
  const players = await getPlayers();

  return { games, players };
}

export async function loaderPlayerStatistics({
  params,
}: LoaderParams<'idPlayer'>) {
  if (!params.idPlayer) {
    throw new Error('Player not found');
  }
  const idPlayer = parseInt(params.idPlayer, 10);

  const games = await getGames();
  const player = await getPlayer(idPlayer);

  return { games, player };
}

export function loaderPlayers() {
  return getPlayers();
}

export function loaderPlayer({ params }: LoaderParams<'idPlayer'>) {
  if (!params.idPlayer) {
    throw new Error('Player not found');
  }
  const idPlayer = parseInt(params.idPlayer, 10);
  return getPlayer(idPlayer);
}
