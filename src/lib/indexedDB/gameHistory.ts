import { GameHistory } from '@types';
import { DB } from './dbUtils';

const TABLE_NAME = 'game_history';

export function createTableHistory(db: IDBDatabase) {
  const objectStore = db.createObjectStore(TABLE_NAME, {
    keyPath: ['idGame', 'idPlayer'],
  });
  objectStore.createIndex('military', 'military', { unique: false });
  objectStore.createIndex('treasury', 'treasury', { unique: false });
  objectStore.createIndex('wonders', 'wonders', { unique: false });
  objectStore.createIndex('civilians', 'civilians', { unique: false });
  objectStore.createIndex('scientifics', 'scientifics', { unique: false });
  objectStore.createIndex('commercials', 'commercials', { unique: false });
  objectStore.createIndex('guilds', 'guilds', { unique: false });
  objectStore.createIndex('armada', 'armada', { unique: false });
  objectStore.createIndex('leaders', 'leaders', { unique: false });
  objectStore.createIndex('cities', 'cities', { unique: false });
  objectStore.createIndex('total', 'total', { unique: false });
  objectStore.createIndex('ranking', 'ranking', { unique: false });
}

export async function createGameHistory(gameHistories: GameHistory[]) {
  const db = await DB.open();
  const transaction = db.transaction([TABLE_NAME], 'readwrite');
  const objectStore = transaction.objectStore(TABLE_NAME);
  const promiseGameHistories = gameHistories.map(async (gameHistory) => {
    const request = objectStore.add(gameHistory);

    return await DB.execute<number>(request, {
      onError: (req) => {
        console.error("Erreur lors de l'ajout de la partie", req.error);
        return req.error;
      },
    });
  });
  return await Promise.all(promiseGameHistories);
}

// export function getGameHistory(idGame: number) {
//   //
// }
