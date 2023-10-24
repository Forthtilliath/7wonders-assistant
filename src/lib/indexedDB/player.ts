import { Player } from '@types';
import { DB } from './dbUtils';

export const TABLE_PLAYER = 'player';

export function createTablePlayer(db: IDBDatabase) {
  const objectStore = db.createObjectStore(TABLE_PLAYER, {
    keyPath: 'idPlayer',
    autoIncrement: true,
  });
  objectStore.createIndex('name', 'name', { unique: false });
  objectStore.createIndex('avatar', 'avatar', { unique: false });
  objectStore.createIndex('isFavorite', 'isFavorite', { unique: false });
  objectStore.createIndex('isArchived', 'isArchived', { unique: false });
  objectStore.createIndex('isDeleted', 'isDeleted', { unique: false });
}

export async function createPlayer(player: Omit<Player, 'idPlayer'>) {
  const db = await DB.open();
  const transaction = db.transaction([TABLE_PLAYER], 'readwrite');
  const objectStore = transaction.objectStore(TABLE_PLAYER);
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
  const transaction = db.transaction([TABLE_PLAYER], 'readonly');
  const objectStore = transaction.objectStore(TABLE_PLAYER);
  const request = objectStore.getAll();

  return DB.execute<Player[]>(request, {
    onError: (req) => {
      console.error('Erreur lors de la récupération des joueurs', req.error);
      return req.error;
    },
  });
}

export async function getPlayer(idPlayer: number) {
  const db = await DB.open();
  const transaction = db.transaction([TABLE_PLAYER], 'readonly');
  const objectStore = transaction.objectStore(TABLE_PLAYER);
  const request = objectStore.get(idPlayer);

  return DB.execute<Player>(request, {
    onError: (req) => {
      console.error('Erreur lors de la récupération du joueur', req.error);
      return req.error;
    },
  });
}

export async function updatePlayer(player: Player) {
  const db = await DB.open();
  const transaction = db.transaction([TABLE_PLAYER], 'readwrite');
  const objectStore = transaction.objectStore(TABLE_PLAYER);
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
  const transaction = db.transaction([TABLE_PLAYER], 'readwrite');
  const objectStore = transaction.objectStore(TABLE_PLAYER);
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

export async function clearPlayers() {
  const db = await DB.open();
  const transaction = db.transaction(TABLE_PLAYER, 'readwrite');
  const objectStore = transaction.objectStore(TABLE_PLAYER);
  const request = objectStore.clear();

  return await DB.execute(request, {
    onError: (req) => {
      console.error('Erreur lors de la suppression des joueurs', req.error);
      return req.error;
    },
    onSuccess: () => console.log('Store des joueurs vidé avec succès'),
  });
}
