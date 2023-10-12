import { Game } from '@types';
import { DB } from './dbUtils';

const TABLE_NAME = 'game';

export function createTableGame(db: IDBDatabase) {
  const objectStore = db.createObjectStore(TABLE_NAME, {
    keyPath: 'idGame',
    autoIncrement: true,
  });
  objectStore.createIndex('leaders', 'leaders', { unique: false });
  objectStore.createIndex('cities', 'cities', { unique: false });
  objectStore.createIndex('babel', 'babel', { unique: false });
  objectStore.createIndex('armada', 'armada', { unique: false });
  objectStore.createIndex('edifice', 'edifice', { unique: false });
}

export async function createGame(game: Omit<Game, 'id'>): Promise<{ idGame: number }> {
  const db = await DB.open();
  const transaction = db.transaction([TABLE_NAME], 'readwrite');
  const objectStore = transaction.objectStore(TABLE_NAME);
  const request = objectStore.add(game);

  return await DB.execute<number, { idGame: number }>(request, {
    onError: (req) => {
      console.error("Erreur lors de l'ajout de la partie", req.error);
      return req.error;
    },
    onSuccess: (req) => ({ idGame: req.result }),
  });
}

// export function getGame(id: number) {
//   //
// }
