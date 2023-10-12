import { Player } from '@/@types';
import { DB } from './dbUtils';

const TABLE_NAME = 'player';

export function createTablePlayer(db: IDBDatabase) {
  const objectStore = db.createObjectStore(TABLE_NAME, {
    keyPath: 'idPlayer',
    autoIncrement: true,
  });
  objectStore.createIndex('name', 'name', { unique: false });
  objectStore.createIndex('avatar', 'avatar', { unique: false });
  objectStore.createIndex('isFavorite', 'isFavorite', { unique: false });
  objectStore.createIndex('isArchived', 'isArchived', { unique: false });
}

export async function createPlayer(player: Omit<Player, 'idPlayer'>) {
  const db = await DB.open();
  const transaction = db.transaction([TABLE_NAME], 'readwrite');
  const objectStore = transaction.objectStore(TABLE_NAME);
  const request = objectStore.add(player);

  return await DB.execute<{ idPlayer: number }>(request, {
    onError: (req) => {
      console.error("Erreur lors de l'ajout du joueur", req.error);
      return req.error;
    },
  });
}

export async function getPlayers() {
  const db = await DB.open();
  const transaction = db.transaction([TABLE_NAME], 'readonly');
  const objectStore = transaction.objectStore(TABLE_NAME);
  const request = objectStore.getAll() as IDBRequest<IDBValidKey>;

  return DB.execute<Player[]>(request, {
    onError: (req) => {
      console.error('Erreur lors de la récupération des joueurs', req.error);
      return req.error;
    },
  });
}

export async function getPlayer(idPlayer: number) {
  const db = await DB.open();
  const transaction = db.transaction([TABLE_NAME], 'readonly');
  const objectStore = transaction.objectStore(TABLE_NAME);
  const request = objectStore.get(idPlayer) as IDBRequest<IDBValidKey>;

  return DB.execute<Player>(request, {
    onError: (req) => {
      console.error('Erreur lors de la récupération du joueur', req.error);
      return req.error;
    },
  });
}

export async function updatePlayer(player: Player) {
  const db = await DB.open();
  const transaction = db.transaction([TABLE_NAME], 'readwrite');
  const objectStore = transaction.objectStore(TABLE_NAME);
  const request = objectStore.put(player);

  return await DB.execute<{ idPlayer: number }>(request, {
    onError: (req) => {
      console.error('Erreur lors de la modification du joueur', req.error);
      return req.error;
    },
  });
}

export async function deletePlayer(idPlayer: number) {
  const db = await DB.open();
  const transaction = db.transaction([TABLE_NAME], 'readwrite');
  const objectStore = transaction.objectStore(TABLE_NAME);
  objectStore.delete(idPlayer);
  // const request = objectStore.delete(idPlayer);

  // TODO LATER
  // return await DB.execute<undefined>(request, {
  //   onError: (req) => {
  //     console.error('Erreur lors de la modification du joueur', req.error);
  //     return req.error;
  //   },
  // });
}
