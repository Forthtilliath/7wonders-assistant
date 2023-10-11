export type Player = {
  id: number;
  name: string;
  avatar: string;
  isFavorite: string;
  isArchived: string;
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
