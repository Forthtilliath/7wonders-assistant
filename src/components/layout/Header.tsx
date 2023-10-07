import { useLocation, useNavigate } from 'react-router-dom';

import { AiOutlineArrowLeft, GiHamburgerMenu } from '@/components/shared/Icons';
import { routes } from '@/data/routes';
import { getLabelAndPrevious } from '@/helpers/array';
import { cn } from '@/helpers/tailwind';

import { ButtonIcon } from '../shared/ButtonIcon';
import { openSidebar } from './SidebarGlobal';

// prettier-ignore
const bg = {
  military:     'bg-red-800 text-white',
  treasury:     'bg-yellow-500 text-wonders-blue',
  wonders:      'bg-yellow-800 text-white',
  civilians:    'bg-yellow-800 text-white',
  scientifics:  'bg-yellow-800 text-white',
  commercials:  'bg-yellow-800 text-white',
  guilds:       'bg-yellow-800 text-white',
  armada:       'bg-yellow-800 text-white',
  leaders:      'bg-yellow-800 text-white',
  cities:       'bg-yellow-800 text-white',
};

export function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const pageDetails = getLabelAndPrevious(pathname, routes);

  return (
    <header
      className={cn(
        'flex h-16 items-center bg-wonders-blue text-wonders-yellow',
        // prettier-ignore
        {
          [bg.military]:    pathname === '/scores/military',
          [bg.treasury]:    pathname === '/scores/treasury',
          [bg.wonders]:     pathname === '/scores/wonders',
          [bg.civilians]:   pathname === '/scores/civilians',
          [bg.scientifics]: pathname === '/scores/scientifics',
          [bg.commercials]: pathname === '/scores/commercials',
          [bg.guilds]:      pathname === '/scores/guilds',
          [bg.armada]:      pathname === '/scores/armada',
          [bg.leaders]:     pathname === '/scores/leaders',
          [bg.cities]:      pathname === '/scores/cities',
        }
      )}>
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
