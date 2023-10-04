import { createBrowserRouter } from 'react-router-dom';

import { MainLayout } from '@/components/layout/MainLayout';
import About from '@/pages/About';
import Feedback from '@/pages/Feedback';
import NewGame from '@/pages/games/NewGame';
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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <NewGame />,
      },
      {
        path: '/players',
        children: [
          {
            path: '/players',
            element: <ListPlayers />,
          },
          {
            path: '/players/new',
            element: <NewPlayer />,
          },
          {
            path: '/players/edit',
            element: <EditPlayer />,
          },
        ],
      },
      {
        path: '/statistics',
        element: <Statistics />,
      },
      {
        path: '/history',
        element: <History />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
      {
        path: '/feedback',
        element: <Feedback />,
      },
      {
        path: '/about',
        element: <About />,
      },
      {
        path: '/support',
        element: <Support />,
      },
      {
        path: '/test',
        children: [
          {
            path: '/test/import',
            element: <TestImport />,
          },
          {
            path: '/test/crop',
            element: <TestCrop />,
          },
          {
            path: '/test/camera',
            element: <TestCamera />,
          },
          {
            path: '/test/gallery',
            element: <TestGallery />,
          },
        ],
      },
    ],
  },
]);
