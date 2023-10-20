import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useToggle } from '@hooks';

type Props = {
  loadData: FormSubmitEventHandler;
};

export function ModalLoadSave({ loadData }: Props) {
  const { t } = useTranslation();
  const [open, toggleOpen] = useToggle(true);

  return (
    <>
      <button onClick={toggleOpen}>{t('settings.load_data')}</button>

      {open && <Modal loadData={loadData} toggleOpen={toggleOpen} />}
    </>
  );
}

type ModalProps = Props & { toggleOpen: () => void };
function Modal({ loadData, toggleOpen }: ModalProps) {
  const { t } = useTranslation();
  const [data, setData] = useState<{
    players: unknown[];
    history: unknown[];
  }>({
    players: [],
    history: [],
  });

  const onChange: InputChangeEventHandler = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        const data = JSON.parse(content);
        setData(data);
      }
    };

    reader.readAsText(file);
  };

  // overlay + modal
  return createPortal(
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 p-10">
      <div className="relative grid w-full max-w-[400px] place-content-center rounded border border-wonders-yellow/50 bg-gray-900 p-5 pt-12">
        <h2 className="absolute left-1.5 top-0.5 text-xl font-bold text-gray-400">
          {t('settings.import')}
        </h2>
        <button
          type="button"
          data-drawer-hide="drawer-navigation"
          aria-controls="drawer-navigation"
          className="absolute right-0.5 top-0.5 inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
          onClick={toggleOpen}>
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"></path>
          </svg>
          <span className="sr-only">Close menu</span>
        </button>

        <form className="flex flex-col gap-4" onSubmit={loadData}>
          <div>
            <h3>{t('settings.preview_data')}</h3>
            <p>
              {t('settings.nb_players')}: {data.players.length}
            </p>
            <p>
              {t('settings.nb_games')}: {data.history.length}
            </p>
          </div>

          <input
            className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400"
            name="file"
            type="file"
            accept=".json"
            onChange={onChange}
          />
          {/* <button onClick={console.log} type="button">
            {t('settings.import')}
          </button> */}

          <button type="submit">{t('settings.confirm_load_data')}</button>
        </form>
      </div>
    </div>,
    document.body
  );
}
