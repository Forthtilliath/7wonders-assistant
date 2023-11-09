/* eslint-disable react-refresh/only-export-components */
import { Suspense } from 'react';
import About from '@/pages/About';
import Feedback from '@/pages/Feedback';
import NewGame from '@/pages/games/NewGame';
import { Armada } from '@/pages/games/scores/Armada';
import { Cities } from '@/pages/games/scores/Cities';
import { Civilians } from '@/pages/games/scores/Civilians';
import { Commercials } from '@/pages/games/scores/Commercials';
import { Guilds } from '@/pages/games/scores/Guilds';
import { Leaders } from '@/pages/games/scores/Leaders';
import { Military } from '@/pages/games/scores/Military';
import { Scientifics } from '@/pages/games/scores/Scientifics';
import { Treasury } from '@/pages/games/scores/Treasury';
import { Wonders } from '@/pages/games/scores/Wonders';
import { GameHistory } from '@/pages/history/GameHistory';
import History from '@/pages/history/History';
import EditPlayer from '@/pages/players/EditPlayer';
import ListPlayers from '@/pages/players/ListPlayers';
import NewPlayer from '@/pages/players/NewPlayer';
import Settings from '@/pages/Settings';
import Statistics from '@/pages/Statistics';
import Support from '@/pages/Support';
import {
  loaderGameHistory,
  loaderPlayer,
  loaderPlayers,
  loaderStatistics,
} from '@lib/loaders';
// import TestCamera from '@/pages/tests/TestCamera';
// import TestCrop from '@/pages/tests/TestCrop';
// import TestGallery from '@/pages/tests/TestGallery';
// import TestImport from '@/pages/tests/TestImport';
import { MainLayout } from '@components/layout';
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
} from '@components/shared/Icons';
import { flattenRoutes } from '@helpers';
import { getGames } from '@lib';

export const ROUTES: Route[] = [
  {
    path: '/',
    element: (
      <Suspense fallback={<>Loading...</>}>
        <MainLayout />
      </Suspense>
    ),
    icon: FaPlus,
    label: 'route.new_game',
    children: [
      {
        path: '/',
        element: <NewGame />,
        loader: loaderPlayers,
      },
      {
        path: '/scores',
        children: [
          {
            path: '/scores/military',
            element: <Military />,
            label: 'route.military',
            previous: true,
          },
          {
            path: '/scores/treasury',
            element: <Treasury />,
            label: 'route.treasury',
            previous: true,
          },
          {
            path: '/scores/wonders',
            element: <Wonders />,
            label: 'route.wonders',
            previous: true,
          },
          {
            path: '/scores/civilians',
            element: <Civilians />,
            label: 'route.civilians',
            previous: true,
          },
          {
            path: '/scores/scientifics',
            element: <Scientifics />,
            label: 'route.scientifics',
            previous: true,
          },
          {
            path: '/scores/commercials',
            element: <Commercials />,
            label: 'route.commercials',
            previous: true,
          },
          {
            path: '/scores/guilds',
            element: <Guilds />,
            label: 'route.guilds',
            previous: true,
          },
          {
            path: '/scores/armada',
            element: <Armada />,
            label: 'route.armada',
            previous: true,
          },
          {
            path: '/scores/leaders',
            element: <Leaders />,
            label: 'route.leaders',
            previous: true,
          },
          {
            path: '/scores/cities',
            element: <Cities />,
            label: 'route.cities',
            previous: true,
          },
        ],
      },
      {
        path: '/statistics',
        element: <Statistics />,
        icon: ImStatsBars,
        label: 'route.statistics',
        loader: loaderStatistics,
      },
      {
        path: '/history',
        icon: AiFillClockCircle,
        label: 'route.histories',
        children: [
          {
            path: '/history',
            element: <History />,
            loader: getGames,
          },
          {
            path: '/history/:idGame',
            element: <GameHistory />,
            label: 'route.history',
            previous: true,
            loader: loaderGameHistory,
          },
        ],
      },
      {
        path: '/players',
        icon: GiMeeple,
        label: 'route.players',
        children: [
          {
            path: '/players',
            element: <ListPlayers />,
            loader: loaderPlayers,
          },
          {
            path: '/players/new',
            element: <NewPlayer />,
            label: 'route.new_player',
            previous: true,
          },
          {
            path: '/players/edit/:idPlayer',
            element: <EditPlayer />,
            label: 'route.edit_player',
            previous: true,
            loader: loaderPlayer,
          },
        ],
      },
      {
        path: '/settings',
        element: <Settings />,
        icon: IoMdSettings,
        label: 'route.settings',
      },
      {
        path: '/feedback',
        element: <Feedback />,
        icon: BiSupport,
        label: 'route.feedback',
      },
      {
        path: '/rate',
        icon: BiSolidStarHalf,
        label: 'route.rate',
      },
      {
        path: '/about',
        element: <About />,
        icon: AiFillQuestionCircle,
        label: 'route.about',
      },
      {
        path: '/support',
        element: <Support />,
        icon: GiCoffeeCup,
        label: 'route.support',
      },
      // {
      //   path: '/test',
      //   children: [
      //     {
      //       path: '/test/import',
      //       element: <TestImport />,
      //       icon: GiCoffeeCup,
      //       label: 'Import Image',
      //     },
      //     {
      //       path: '/test/crop',
      //       element: <TestCrop />,
      //       icon: GiCoffeeCup,
      //       label: 'Crop Image',
      //     },
      //     {
      //       path: '/test/camera',
      //       element: <TestCamera />,
      //       icon: GiCoffeeCup,
      //       label: 'Camera Image',
      //     },
      //     {
      //       path: '/test/gallery',
      //       element: <TestGallery />,
      //       icon: GiCoffeeCup,
      //       label: 'Gallery Images',
      //     },
      //   ],
      // },
    ],
  },
];

export const ROUTES_MENU = flattenRoutes(ROUTES);
