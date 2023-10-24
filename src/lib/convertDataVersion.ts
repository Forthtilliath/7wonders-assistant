import { isVersion } from '@helpers';
import { APP_CONST } from '@constants';
import { type Data, dataSchema } from './zodSchemas';

export type DataVersion = Data[keyof Data];

const lastSchemaVersion = dataSchema[APP_CONST.version];

export function convertDataVersion<T extends DataVersion>(
  dataIn: T
): ReturnType<typeof lastSchemaVersion.safeParse> {
  const result = dataSchema[dataIn.settings.version].safeParse(dataIn);

  if (!result.success) {
    return result;
  }

  let dataOut: DataVersion = dataIn;

  if (isVersion(dataOut, '0.1.0')) {
    console.log('Convert version 0.1.0 to version 0.2.0');
    dataOut = convertDataFromVersion0_1_0To0_2_0(dataOut);
  }

  if (isVersion(dataOut, '0.2.0')) {
    console.log('Convert version 0.2.0 to version 0.3.0');
    dataOut = convertDataFromVersion0_2_0To0_3_0(dataOut);
  }

  return dataSchema[APP_CONST.version].safeParse(dataOut);
}

function convertDataFromVersion0_2_0To0_3_0(
  dataIn: Data['0.2.0']
): Data['0.3.0'] {
  const dataNextVersion: Data['0.3.0'] = {
    ...dataIn,
    settings: { ...dataIn.settings, version: '0.3.0' as const },
    players: dataIn.players.map((p) => {
      return { ...p, isDeleted: false };
    }),
  };

  return dataNextVersion;
}

function convertDataFromVersion0_1_0To0_2_0(
  dataIn: Data['0.1.0']
): Data['0.2.0'] {
  const dataNextVersion: Data['0.2.0'] = {
    ...dataIn,
    settings: {
      ...dataIn.settings,
      version: '0.2.0' as const,
    },
    history: dataIn.history.map((h) => {
      const { idGame, createdAt, ...extensions } = h.game;
      return {
        ...h,
        game: {
          idGame,
          createdAt,
          extensions: Object.entries(extensions)
            .filter(([, v]) => v)
            .map(
              ([k]) =>
                k.toLowerCase() as
                  | 'leaders'
                  | 'cities'
                  | 'babel'
                  | 'armada'
                  | 'edifice'
            ),
        },
      };
    }),
  };

  return dataNextVersion;
}
