import { Game, GameHistoriesComplete } from '@types';
import { DB } from './dbUtils';
import { getGameHistory } from './gameHistory';

export const TABLE_GAME = 'game';

export function createTableGame(db: IDBDatabase) {
  const objectStore = db.createObjectStore(TABLE_GAME, {
    keyPath: 'idGame',
    autoIncrement: true,
  });
  objectStore.createIndex('createdAt', 'createdAt', { unique: false });
  objectStore.createIndex('leaders', 'leaders', { unique: false });
  objectStore.createIndex('cities', 'cities', { unique: false });
  objectStore.createIndex('babel', 'babel', { unique: false });
  objectStore.createIndex('armada', 'armada', { unique: false });
  objectStore.createIndex('edifice', 'edifice', { unique: false });
}

export async function createGame(
  game: Omit<Game, 'idGame'>
): Promise<{ idGame: number }> {
  const db = await DB.open();
  const transaction = db.transaction([TABLE_GAME], 'readwrite');
  const objectStore = transaction.objectStore(TABLE_GAME);
  const request = objectStore.add(game);

  return await DB.execute<number, { idGame: number }>(request, {
    onError: (req) => {
      console.error("Erreur lors de l'ajout de la partie", req.error);
      return req.error;
    },
    onSuccess: (req) => ({ idGame: req.result }),
  });
}

export async function getGame(idGame: number) {
  const db = await DB.open();
  const transaction = db.transaction([TABLE_GAME], 'readonly');
  const objectStore = transaction.objectStore(TABLE_GAME);
  const request = objectStore.get(idGame);

  return DB.execute<Game>(request, {
    onError: (req) => {
      console.error('Erreur lors de la récupération du joueur', req.error);
      return req.error;
    },
  });
}

export async function getGames() {
  const db = await DB.open();
  const transaction = db.transaction([TABLE_GAME], 'readonly');
  const objectStore = transaction.objectStore(TABLE_GAME);
  const request = objectStore.getAll();

  return DB.execute<Game[], Promise<GameHistoriesComplete[]>>(request, {
    onError: (req) => {
      console.error('Erreur lors de la récupération du joueur', req.error);
      return req.error;
    },
    onSuccess: async (req) => {
      const games = await Promise.all<Promise<GameHistoriesComplete>>(
        req.result.map((game) => getGameHistory(game.idGame))
      );

      return games;
    },
  });
}
