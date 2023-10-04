import { Link, useLocation } from 'react-router-dom';

import { AiOutlineArrowLeft, GiHamburgerMenu } from '@/components/shared/Icons';
import { menuPages, otherPages } from '@/data/menu';

import { ButtonIcon } from '../shared/ButtonIcon';
import { openSidebar } from './SidebarGlobal';

const NOT_FOUND_PAGE: PageItem = {
  href: '/',
  label: 'Page Not Found',
};

export function Header() {
  const { pathname } = useLocation();
  const pageDetails =
    [...menuPages, ...otherPages].find((m) => m.href === pathname) ??
    NOT_FOUND_PAGE;

  return (
    <header className="flex h-16 items-center bg-wonders-blue text-wonders-yellow">
      <div className="text-center">
        {pageDetails.previous ? (
          <Link
            to={pageDetails.previous}
            className="m-4 block text-2xl font-medium"
            aria-label="Go back">
            <AiOutlineArrowLeft size={'1.5rem'} />
          </Link>
        ) : (
          <ButtonIcon
            aria-controls="drawer-navigation"
            onClick={openSidebar}
            icon={GiHamburgerMenu}
          />
        )}
      </div>

      <h1 className="ml-2 flex-grow text-xl font-semibold">
        {pageDetails?.label}
      </h1>
    </header>
  );
}
