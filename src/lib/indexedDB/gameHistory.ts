import {
  GameHistoriesComplete,
  GameHistory,
  GameHistoryWithPlayer,
} from '@types';
import { DB } from './dbUtils';
import { getGame, TABLE_GAME } from './game';
import { getPlayer, TABLE_PLAYER } from './player';

const TABLE_GAME_HISTORY = 'game_history';

export function createTableHistory(db: IDBDatabase) {
  const objectStore = db.createObjectStore(TABLE_GAME_HISTORY, {
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

  objectStore.createIndex('player', 'idPlayer', {
    unique: false,
    multiEntry: true,
  });
  objectStore.createIndex('game', 'idGame', {
    unique: false,
    multiEntry: true,
  });
}

export async function createGameHistory(gameHistories: GameHistory[]) {
  const db = await DB.open();
  const transaction = db.transaction([TABLE_GAME_HISTORY], 'readwrite');
  const objectStore = transaction.objectStore(TABLE_GAME_HISTORY);
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

export async function getGameHistory(idGame: number) {
  const db = await DB.open();
  const transaction = db.transaction(
    [TABLE_GAME_HISTORY, TABLE_GAME, TABLE_PLAYER],
    'readonly'
  );
  const objectStore = transaction.objectStore(TABLE_GAME_HISTORY);
  const index = objectStore.index('game');
  const request = index.getAll(idGame);

  return DB.execute<GameHistory[], Promise<GameHistoriesComplete>>(request, {
    onError: (req) => {
      console.error(
        "Erreur lors de la récupération de l'historique de la partie",
        req.error
      );
      return req.error;
    },
    onSuccess: async (req) => {
      const game = await getGame(req.result[0].idGame);
      const scores = await Promise.all<GameHistoryWithPlayer>(
        req.result.map(async (score) => {
          const player = await getPlayer(score.idPlayer);
          return { ...score, player };
        })
      );

      return { game, scores };
    },
  });
}
