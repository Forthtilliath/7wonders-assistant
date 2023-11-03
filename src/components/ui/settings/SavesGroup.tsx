import { useTranslation } from 'react-i18next';
import { DB } from '@lib/indexedDB/dbUtils';
import { GroupInputs } from '@components/shared';
import { getLocalStorage, setLocalStorage } from '@helpers';
import type { DataVersion } from '@lib';
import {
  convertDataVersion,
  createGame,
  createGameHistory,
  createPlayer,
  getGames,
  getPlayers,
} from '@lib';
import { useSave } from '@hooks';
import { APP_CONST, LS_KEY } from '@constants';
import { ButtonSettings } from '../ButtonSettings';
import { ModalLoadSave } from './ModalLoadSave';

export function SavesGroup() {
  const { i18n, t } = useTranslation();
  const { downloadAsJson } = useSave();

  const saveData = async () => {
    const data: CurrentVersion = {
      settings: {
        extensions: getLocalStorage('extensions', []) as Extension[],
        language: i18n.resolvedLanguage as 'fr' | 'en',
        version: APP_CONST.version,
      },
      players: await getPlayers(),
      history: await getGames(),
    };

    downloadAsJson(data, 'save-7wonders.json');
  };

  const loadData = async (data: DataVersion) => {
    if (APP_CONST.version !== data.settings.version) {
      console.log('different version');
    }
    const result = convertDataVersion(data);

    if (!result.success) {
      console.error(result.error);
      return;
    }

    await DB.clear();

    result.data.players.forEach((player) => createPlayer(player));
    result.data.history.forEach(async (gameDetail) => {
      await createGame(gameDetail.game);
      await createGameHistory(gameDetail.scores);
    });

    i18n.changeLanguage(result.data.settings.language);
    setLocalStorage(LS_KEY.extensions, result.data.settings.extensions);
  };

  const clearData = async () => {
    // TODO: Open modal to confirm
    await DB.clear();
  };

  return (
    <GroupInputs title={t('settings.saves')} className="mt-8">
      <ButtonSettings color="primary" onClick={saveData}>
        {t('settings.save_data')}
      </ButtonSettings>
      <ModalLoadSave loadData={loadData}>
        <ButtonSettings color="primary">
          {t('settings.load_data')}
        </ButtonSettings>
      </ModalLoadSave>
      <ButtonSettings color="warning" onClick={clearData}>
        {t('settings.clear_data')}
      </ButtonSettings>
    </GroupInputs>
  );
}

/**
 * Lors du save des data :
 * - save la version de l'app
 * - save les data
 * Lors du load des data :
 * - load les data
 * - check la version
 * - si version app === version data
 *    - envoi les data tel quel
 * - sinon :
 *    - convert data
 *
 *
 */
