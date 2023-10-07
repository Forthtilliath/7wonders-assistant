import { MainLayout } from '@/components/layout/MainLayout';
import {
  AiFillClockCircle,
  AiFillQuestionCircle,
  BiSolidStarHalf,
  BiSupport,
  FaPlus,
  GiCoffeeCup,
  GiMeeple,
  ImStatsBars,
  IoMdSettings,
} from '@/components/shared/Icons';
import { flattenRoutes } from '@/helpers/array';
import About from '@/pages/About';
import Feedback from '@/pages/Feedback';
import NewGame from '@/pages/games/NewGame';
import { Commercial } from '@/pages/games/scores/Commercial';
import { Military } from '@/pages/games/scores/Military';
import { Treasury } from '@/pages/games/scores/Treasury';
import History from '@/pages/history/History';
import EditPlayer from '@/pages/players/EditPlayer';
import ListPlayers from '@/pages/players/ListPlayers';
import NewPlayer from '@/pages/players/NewPlayer';
import Settings from '@/pages/Settings';
import Statistics from '@/pages/Statistics';
import Support from '@/pages/Support';
import TestCamera from '@/pages/tests/TestCamera';
import TestCrop from '@/pages/tests/TestCrop';
import TestGallery from '@/pages/tests/TestGallery';
import TestImport from '@/pages/tests/TestImport';

export const routes: Route[] = [
  {
    path: '/',
    element: <MainLayout />,
    icon: FaPlus,
    label: 'New Game',
    children: [
      {
        path: '/',
        element: <NewGame />,
      },
      {
        path: '/scores',
        children: [
          {
            path: '/scores/military',
            element: <Military />,
            label: 'Military conflicts',
            previous: true,
          },
          {
            path: '/scores/treasury',
            element: <Treasury />,
            label: 'Treasury',
            previous: true,
          },
          {
            path: '/scores/wonders',
            element: <Commercial />,
            label: 'Wonders',
            previous: true,
          },
          {
            path: '/scores/civilians',
            element: <Commercial />,
            label: 'Civilians structures',
            previous: true,
          },
          {
            path: '/scores/scientifics',
            element: <Commercial />,
            label: 'Scientifics structures',
            previous: true,
          },
          {
            path: '/scores/commercials',
            element: <Commercial />,
            label: 'Commercials structures',
            previous: true,
          },
          {
            path: '/scores/guilds',
            element: <Commercial />,
            label: 'Guilds',
            previous: true,
          },
          {
            path: '/scores/armada',
            element: <Commercial />,
            label: 'Armada',
            previous: true,
          },
          {
            path: '/scores/leaders',
            element: <Commercial />,
            label: 'Leaders',
            previous: true,
          },
          {
            path: '/scores/cities',
            element: <Commercial />,
            label: 'Cities',
            previous: true,
          },
        ],
      },
      {
        path: '/statistics',
        element: <Statistics />,
        icon: ImStatsBars,
        label: 'Statistics',
      },
      {
        path: '/history',
        element: <History />,
        icon: AiFillClockCircle,
        label: 'Games History',
      },
      {
        path: '/players',
        icon: GiMeeple,
        label: 'Players Management',
        children: [
          {
            path: '/players',
            element: <ListPlayers />,
          },
          {
            path: '/players/new',
            element: <NewPlayer />,
            label: 'New Player',
            previous: true,
          },
          {
            path: '/players/edit',
            element: <EditPlayer />,
            label: 'Edit Player',
            previous: true,
          },
        ],
      },
      {
        path: '/settings',
        element: <Settings />,
        icon: IoMdSettings,
        label: 'Settings',
      },
      {
        path: '/feedback',
        element: <Feedback />,
        icon: BiSupport,
        label: 'Feedback & Support',
      },
      {
        path: 'http://www.google.fr',
        icon: BiSolidStarHalf,
        label: 'Rate Us',
      },
      {
        path: '/about',
        element: <About />,
        icon: AiFillQuestionCircle,
        label: 'About',
      },
      {
        path: '/support',
        element: <Support />,
        icon: GiCoffeeCup,
        label: 'Support Us',
      },
      {
        path: '/test',
        children: [
          {
            path: '/test/import',
            element: <TestImport />,
            icon: GiCoffeeCup,
            label: 'Import Image',
          },
          {
            path: '/test/crop',
            element: <TestCrop />,
            icon: GiCoffeeCup,
            label: 'Crop Image',
          },
          {
            path: '/test/camera',
            element: <TestCamera />,
            icon: GiCoffeeCup,
            label: 'Camera Image',
          },
          {
            path: '/test/gallery',
            element: <TestGallery />,
            icon: GiCoffeeCup,
            label: 'Gallery Images',
          },
        ],
      },
    ],
  },
];

export const routesMenu = flattenRoutes(routes);
