import { createPortal } from 'react-dom';
import { cn } from '@/helpers';
import { Overlay } from './Overlay';

type Props = {
  open?: boolean;
  title?: string;
  content?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  showCloseButton?: boolean;
  showIcon?: boolean;
  colorIcon?: 'alert';
};

export function ConfirmDialog({
  open,
  title,
  content,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  showCloseButton,
  showIcon,
  colorIcon,
}: Props) {
  return (
    open &&
    createPortal(
      <>
        <dialog
          open={open}
          onCancel={onCancel}
          // className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow dark:bg-gray-700"
          className="fixed inset-x-0 bottom-0 z-50 mx-4 mb-4 w-auto rounded-lg bg-white p-4 md:bottom-auto md:left-1/2 md:top-1/2 md:mx-auto md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2">
          {showCloseButton && (
            <button
              type="button"
              className={cn(
                'absolute right-2.5 top-3 ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white'
              )}
              data-modal-hide="popup-modal">
              <svg
                className="h-3 w-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          )}
          <div className="p-6">
            <div className="flex gap-6">
              {showIcon && (
                <svg
                  className={cn(
                    'mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200',
                    {
                      'text-red-500 dark:text-red-600': colorIcon === 'alert',
                    }
                  )}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              )}

              <main className="flex-grow">
                <h2 className="text-lg font-bold">{title ?? 'Confirmation'}</h2>

                <p className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  {content ?? 'Voulez vous vraiment effectuer cette action ?'}
                </p>
              </main>
            </div>

            <form onSubmit={onConfirm} method="dialog" className="text-right">
              <button
                data-modal-hide="popup-modal"
                type="button"
                value="cancel"
                onClick={onCancel}
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-600">
                {cancelLabel ?? 'Annuler'}
              </button>
              <button
                data-modal-hide="popup-modal"
                type="submit"
                className="ml-2 inline-flex items-center rounded-lg bg-red-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800">
                {confirmLabel ?? 'Confirmer'}
              </button>
            </form>
          </div>
        </dialog>
        <Overlay onClick={() => console.log('overlay')} />
      </>,
      document.body
    )
  );
}
