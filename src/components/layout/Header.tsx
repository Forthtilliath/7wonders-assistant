import {  useLocation, useNavigate } from 'react-router-dom';

import { AiOutlineArrowLeft, GiHamburgerMenu } from '@/components/shared/Icons';
import { routes } from '@/data/routes';
import { getLabelAndPrevious } from '@/helpers/array';

import { ButtonIcon } from '../shared/ButtonIcon';
import { openSidebar } from './SidebarGlobal';

export function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const pageDetails = getLabelAndPrevious(pathname, routes);

  return (
    <header className="flex h-16 items-center bg-wonders-blue text-wonders-yellow">
      <div className="text-center">
        {pageDetails.previous ? (
          <button
            onClick={() => navigate(-1)}
            className="m-4 block text-2xl font-medium"
            aria-label="Go back">
            <AiOutlineArrowLeft size={'1.5rem'} />
          </button>
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
