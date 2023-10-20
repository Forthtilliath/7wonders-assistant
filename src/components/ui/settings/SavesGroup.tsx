import { useTranslation } from 'react-i18next';
import { GroupInputs } from '@components/shared';
import { getLocalStorage } from '@helpers';
import type { DataLastVersion, DataVersion } from '@lib';
import { getGames, getPlayers } from '@lib';
import { useSave } from '@hooks';
import { APP_CONST } from '@constants';
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

  return (
    <GroupInputs title={t('settings.saves')} className="mt-8">
      <button onClick={saveData}>{t('settings.save_data')}</button>
      <ModalLoadSave loadData={loadData} />
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
