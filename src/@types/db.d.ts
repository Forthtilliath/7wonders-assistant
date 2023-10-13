export type Player = {
  idPlayer: number;
  name: string;
  avatar: string;
  isFavorite: boolean;
  isArchived: boolean;
};

export type Game = {
  id: number;
} & Record<Extension, boolean>;

export type GameHistory = {
  idGame: number;
  idPlayer: number;
  military: number;
  treasury: number;
  wonders: number;
  civilians: number;
  scientifics: number;
  commercials: number;
  guilds: number;
  armada: number;
  leaders: number;
  cities: number;
  total: number;
  ranking: number;
};

export type GameHistoryWithPlayer = GameHistory & {
  player: Player;
};

export type GameHistoriesComplete = {
  game: Game;
  scores: GameHistoryWithPlayer[];
};
