import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { assertsIsDefined } from '@/helpers';
import { DataVersion } from '@lib';
import { useLoadFile } from '@hooks';

type Props = {
  loadData: (data: DataVersion) => void;
};

export function ModalLoadSave({ loadData }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>{t('settings.load_data')}</button>

      {open && <Modal loadData={loadData} close={() => setOpen(false)} />}
    </>
  );
}

type ModalProps = Props & { close: () => void };
function Modal({ loadData, close }: ModalProps) {
  const { t } = useTranslation();
  const [data, onChange] = useLoadFile();

  const closeModal: DivClickEventHandler = (e) => {
    if (e.currentTarget !== e.target) return;
    e.stopPropagation();
    close();
  };

  const onSubmit: FormSubmitEventHandler = (e) => {
    e.preventDefault();
    assertsIsDefined(data);

    loadData(data);
    close();
  };

  return createPortal(
    <div
      className="absolute inset-0 flex items-center justify-center bg-gray-900/80 p-10"
      onClick={closeModal}>
      <div className="relative grid w-full max-w-[400px] place-content-center rounded border border-wonders-yellow/50 bg-gray-900 p-5 pt-12">
        <h2 className="absolute left-1.5 top-0.5 text-lg font-bold text-gray-400">
          {t('settings.load_data')}
        </h2>
        <button
          type="button"
          data-drawer-hide="drawer-navigation"
          aria-controls="drawer-navigation"
          className="absolute right-0.5 top-0.5 inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
          onClick={close}>
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span className="sr-only">Close menu</span>
        </button>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div>
            <h3>{t('settings.preview_data')}</h3>
            <ul>
              <li className="pl-2">
                - {t('settings.nb_players')}: {data?.players.length ?? '-'}
              </li>
              <li className="pl-2">
                - {t('settings.nb_games')}: {data?.history.length ?? '-'}
              </li>
            </ul>
          </div>

          <input
            className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 file:mr-2 file:px-2 hover:file:cursor-pointer focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400"
            name="file"
            type="file"
            accept=".json"
            onChange={onChange}
          />

          <button type="submit" disabled={!data}>
            {t('settings.confirm_load_data')}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
