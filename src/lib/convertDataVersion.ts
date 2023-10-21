type Data_0_1_0 = {
  settings: {
    extensions: ('leaders' | 'cities' | 'babel' | 'armada' | 'edifice')[];
    language: string;
    version: string;
  };
  players: {
    idPlayer: number;
    name: string;
    avatar: string;
    isFavorite: boolean;
    isArchived: boolean;
  }[];
  history: {
    game: {
      idGame: number;
      createdAt: number;
      extensions: ('leaders' | 'cities' | 'babel' | 'armada' | 'edifice')[];
    };
    scores: {
      idGame: number;
      idPlayer: number;
      total: number;
      ranking: number;
      military: number;
      treasury: number;
      wonders: number;
      civilians: number;
      scientifics: number;
      commercials: number;
      guilds: number;
      leaders?: number;
      cities?: number;
      armada?: number;
    }[];
  }[];
};

export type DataVersion = Data_0_1_0;

export type DataLastVersion = Data_0_1_0;

export function convertDataVersion<T extends DataVersion>(data: T) {
  let version = data.settings.version;

  if (version === '0.1.0') {
    // convert to next version : 0.2.0
    version = '0.2.0';
  }

  return data;
}
