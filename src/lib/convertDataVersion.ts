import { GameHistoriesComplete, Player } from "@types";

type Data_0_1_0 = {
  settings: {
    extensions: Extension[];
    language: string;
    version: string;
  };
  players: Player[];
  history: GameHistoriesComplete[];
};

export type DataVersion = Data_0_1_0

export type DataLastVersion = Data_0_1_0;

export function convertDataVersion<T extends DataVersion>(data: T) {
  let version = data.settings.version;

  if (version === '0.1.0') {
    // convert to next version : 0.2.0
    version = '0.2.0';
  }

  return data;
}