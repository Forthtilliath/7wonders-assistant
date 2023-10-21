import { useTranslation } from 'react-i18next';
import { DB } from '@lib/indexedDB/dbUtils';
import { GroupInputs } from '@components/shared';
import { getLocalStorage } from '@helpers';
import type { DataLastVersion, DataVersion } from '@lib';
import { getGames, getPlayers } from '@lib';
import { useSave } from '@hooks';
import { APP_CONST } from '@constants';
import { ButtonSettings } from '../ButtonSettings';
import { ModalLoadSave } from './ModalLoadSave';

export function SavesGroup() {
  const { i18n, t } = useTranslation();
  const { downloadAsJson } = useSave();

  const saveData = async () => {
    const data: DataLastVersion = {
      settings: {
        extensions: getLocalStorage('extensions', []) as Extension[],
        language: i18n.language,
        version: APP_CONST.version,
      },
      players: await getPlayers(),
      history: await getGames(),
    };

    downloadAsJson(data, 'save-7wonders.json');
  };

  const loadData = (data: DataVersion) => {
    if (APP_CONST.version !== data.settings.version) {
      console.log('different version');
    }
    console.log(data);
  };

  const clearData = () => {
    // TODO: Open modal to confirm
    DB.clear();
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
