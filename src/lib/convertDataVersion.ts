import { isVersion } from '@helpers';
import { APP_CONST } from '@constants';
import { Data, dataSchema } from './zodSchemas';

export type DataVersion = Data[keyof Data];

export type DataLastVersion = Data['0.3.0'];

export function convertDataVersion<T extends DataVersion>(data: T) {
  const version = data.settings.version;
  const result = dataSchema[version].safeParse(data);

  if (!result.success) {
    return result;
  }

  if (version === APP_CONST.version) {
    return {
      success: true,
      data,
    };
  }

  if (isVersion(data, '0.2.0')) {
    const dataNextVersion: Data['0.3.0'] = {
      ...data,
      settings: { ...data.settings, version: '0.3.0' as const },
      players: data.players.map((p) => {
        return { ...p, isDeleted: false };
      }),
    };
    return convertDataVersion(dataNextVersion);
  }

  if (isVersion(data, '0.1.0')) {
    const dataNextVersion: Data['0.2.0'] = {
      ...data,
      settings: Object.assign(data.settings, { version: '0.2.0' as const }),
      history: data.history.map((h) => {
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
    return convertDataVersion(dataNextVersion);
  }

  return result;
}
