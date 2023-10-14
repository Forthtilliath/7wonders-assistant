export type Player = {
  idPlayer: number;
  name: string;
  avatar: string;
  isFavorite: boolean;
  isArchived: boolean;
};

export type Game = {
  id: number;
  createdAt: number;
} & Record<Extension, boolean>;

export type GameHistory = {
  idGame: number;
  idPlayer: number;
  total: number;
  ranking: number;
} & Scores;

export type GameHistoryWithPlayer = GameHistory & {
  player: Player;
};

export type GameHistoriesComplete = {
  game: Game;
  scores: GameHistoryWithPlayer[];
};

export type Scores = Record<Category, number>;
