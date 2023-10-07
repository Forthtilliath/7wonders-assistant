import { MenuItem } from '@/components/layout/sidebar/MenuItem';
import { BiSolidPyramid } from '@/components/shared/Icons';
import { APP_CONST } from '@/data/app';
import { routesMenu } from '@/data/routes';
import { cn } from '@/helpers/tailwind';

import { closeSidebar } from '../SidebarGlobal';

type Props = {
  isOpen: boolean;
};

export function Sidebar({ isOpen }: Props) {
  return (
    <>
      <div
        id="drawer-navigation"
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-80 max-w-full overflow-y-auto bg-white p-4 transition-transform dark:bg-wonders-blue-dark',
          { '-translate-x-full': !isOpen }
        )}
        tabIndex={-1}
        aria-labelledby="drawer-navigation-label">
        <header className="flex items-center gap-4 pb-6">
          <BiSolidPyramid size="2rem" />
          <h5
            id="drawer-navigation-label"
            className="text-base font-semibold uppercase text-gray-500 dark:text-gray-400">
            {APP_CONST.title}
          </h5>
        </header>
        <button
          type="button"
          data-drawer-hide="drawer-navigation"
          aria-controls="drawer-navigation"
          className="absolute right-2.5 top-2.5 inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
          onClick={closeSidebar}>
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
        <div className="overflow-y-auto">
          <ul className="space-y-2 font-medium">
            {routesMenu.map((route) => (
              <MenuItem key={route.path} {...route} />
            ))}
          </ul>
        </div>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70"
          onClick={closeSidebar}
        />
      )}
    </>
  );
}
