import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ButtonIcon } from '@components/shared';
import { AiOutlineArrowLeft, GiHamburgerMenu } from '@components/shared/Icons';
import { cn, getLabelAndPrevious } from '@helpers';
import { usePageAnimationStore } from '@lib';
import { ROUTES } from '@constants';
import { openSidebar } from './Sidebar';

// prettier-ignore
const bg = {
  military:     'bg-red-800 text-white',
  treasury:     'bg-yellow-500 text-wonders-blue',
  wonders:      '',
  civilians:    'bg-blue-600 text-white',
  scientifics:  'bg-green-600 text-white',
  commercials:  'bg-yellow-400 text-wonders-blue',
  guilds:       'bg-purple-700 text-white',
  armada:       'bg-sky-500 text-wonders-blue-dark',
  leaders:      'bg-slate-200 text-wonders-blue',
  cities:       'bg-black text-white',
};

export function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const pageDetails = getLabelAndPrevious(pathname, ROUTES);
  const location = useLocation();
  const { t } = useTranslation();
  const setPrevious = usePageAnimationStore((s) => s.setIsPrevious);

  // const data = useLoaderData();

  // if (pathname.startsWith('/statistics/')) {
  //   console.log("statistics", data)
  //   //
  // }

  const handlePrevious = () => {
    setPrevious(true);
    navigate(location.state?.from ?? -1);
  };

  return (
    <header
      className={cn(
        'h-16 min-h-[4rem] bg-wonders-blue text-wonders-yellow shadow-bottom',
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
      <div className="mx-auto flex h-full w-full max-w-app items-center">
        <div className="text-center">
          {pageDetails.previous ? (
            <ButtonIcon
              onClick={handlePrevious}
              icon={AiOutlineArrowLeft}
              className="m-4 block text-2xl font-medium">
              <span className="sr-only">Go previous page</span>
            </ButtonIcon>
          ) : (
            <ButtonIcon
              aria-controls="drawer-navigation"
              onClick={openSidebar}
              icon={GiHamburgerMenu}
              className="ml-4">
              <span className="sr-only">Open menu</span>
            </ButtonIcon>
          )}
        </div>

        <h1 className="-mt-1 ml-2 flex-grow text-xl font-semibold">
          {pageDetails?.label ? t(pageDetails.label) : ''}
        </h1>
      </div>
    </header>
  );
}
