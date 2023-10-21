import { createTableGame } from './game';
import { createTableHistory as createTableGameHistory } from './gameHistory';
import { createTablePlayer } from './player';

const DATABASE = '7Wonders-Assistant';

const open = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE, 2);

    request.onerror = (event) => {
      const req = event.currentTarget as IDBRequest<IDBDatabase>;
      console.error(
        "Erreur lors de l'ouverture de la base de données",
        req.error
      );
      reject(req.error);
    };

    request.onsuccess = (event) => {
      const req = event.currentTarget as IDBRequest<IDBDatabase>;
      const db = req.result;
      resolve(db);
    };

    // Primary Key : IdHistory + IdPlayer
    request.onupgradeneeded = (event) => {
      const req = event.currentTarget as IDBRequest<IDBDatabase>;
      const db = req.result;
      createTablePlayer(db);
      createTableGame(db);
      createTableGameHistory(db);
    };
  });
};

function execute<TResult = unknown, TReturn = TResult>(
  request: IDBRequest<IDBValidKey>,
  {
    onError,
    onSuccess = (req) => req.result,
  }: {
    onError?: (req: IDBRequest<IDBValidKey>) => DOMException | null;
    onSuccess?: (req: IDBRequest<TResult>) => TReturn | TResult;
  }
): Promise<TResult | TReturn> {
  return new Promise((resolve, reject) => {
    request.onerror = (event) => {
      const req = event.target as IDBRequest<IDBValidKey>;
      reject(onError?.(req));
    };

    request.onsuccess = (event) => {
      const req = event.target as IDBRequest<TResult>;
      resolve(onSuccess?.(req));
    };
  });
}

async function clear() {
  const db = await DB.open();

  const transaction = db.transaction(DATABASE, 'readwrite');
  const objectStore = transaction.objectStore(DATABASE);
  const request = objectStore.clear();

  return await DB.execute<undefined, void>(request, {
    onError: (req) => {
      console.error('Erreur lors de la suppression des données', req.error);
      return req.error;
    },
    onSuccess: () => console.log('Base de données vidée avec succès'),
  });
}

export const DB: IndexedDB = {
  open,
  execute,
  clear,
};
