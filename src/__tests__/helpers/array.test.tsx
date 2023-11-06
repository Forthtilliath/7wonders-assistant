import NewGame from '@/pages/games/NewGame';
import EditPlayer from '@/pages/players/EditPlayer';
import ListPlayers from '@/pages/players/ListPlayers';
import NewPlayer from '@/pages/players/NewPlayer';
import Settings from '@/pages/Settings';
import Statistics from '@/pages/Statistics';
import { loaderStatistics } from '@lib/loaders';
import { MainLayout } from '@components/layout';
import {
  FaPlus,
  GiMeeple,
  ImStatsBars,
  IoMdSettings,
} from '@components/shared/Icons';
import {
  addValueIntoMax,
  addValueIntoMin,
  avg,
  countScienceScore,
  flattenRoutes,
  getLabelAndPrevious,
  sum,
} from '@helpers';
import { ROUTES } from '@constants';

describe('Arrays methods', () => {
  describe('Method: flattenRoutes()', () => {
    it('should return an empty array if routes is empty', () => {
      expect(flattenRoutes([])).toStrictEqual([]);
    });

    it('should return all routes if the array has no children routes', () => {
      const routes: Route[] = [
        {
          path: '/',
          element: <MainLayout />,
          icon: FaPlus,
          label: 'route.new_game',
        },
        {
          path: '/statistics',
          element: <Statistics />,
          icon: ImStatsBars,
          label: 'route.statistics',
          loader: loaderStatistics,
        },
        {
          path: '/settings',
          element: <Settings />,
          icon: IoMdSettings,
          label: 'route.settings',
        },
      ];

      const expectedRoutes: MenuItem[] = [
        { icon: FaPlus, label: 'route.new_game', path: '/' },
        { icon: ImStatsBars, label: 'route.statistics', path: '/statistics' },
        { icon: IoMdSettings, label: 'route.settings', path: '/settings' },
      ];

      expect(flattenRoutes(routes)).toStrictEqual(expectedRoutes);
    });

    it('should not return twice the same route if the children has the same path', () => {
      const routes: Route[] = [
        {
          path: '/',
          element: <MainLayout />,
          icon: FaPlus,
          label: 'route.new_game',
          children: [
            {
              path: '/',
              element: <NewGame />,
            },
          ],
        },
      ];

      const expectedRoutes: MenuItem[] = [
        { icon: FaPlus, label: 'route.new_game', path: '/' },
      ];

      expect(flattenRoutes(routes)).toStrictEqual(expectedRoutes);
    });

    it('should not return children routes', () => {
      const routes: Route[] = [
        {
          path: '/',
          element: <MainLayout />,
          icon: FaPlus,
          label: 'route.new_game',
          children: [
            {
              path: '/',
              element: <NewGame />,
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
            },
          ],
        },
      ];

      const expectedRoutes: MenuItem[] = [
        { icon: FaPlus, label: 'route.new_game', path: '/' },
        { icon: GiMeeple, label: 'route.players', path: '/players' },
      ];

      expect(flattenRoutes(routes)).toStrictEqual(expectedRoutes);
    });
  });

  describe('Method: getLabelAndPrevious()', () => {
    it('should return the home page', () => {
      expect(getLabelAndPrevious('/', ROUTES)).toStrictEqual({
        label: 'route.new_game',
        previous: undefined,
      });
    });

    it('should return an undefined label & previous if routes is empty', () => {
      expect(getLabelAndPrevious('/', [])).toStrictEqual({
        label: undefined,
        previous: undefined,
      });
    });

    it('should return statistics label', () => {
      const routes: Route[] = [
        {
          path: '/',
          element: <MainLayout />,
          icon: FaPlus,
          label: 'route.new_game',
        },
        {
          path: '/statistics',
          element: <Statistics />,
          icon: ImStatsBars,
          label: 'route.statistics',
          loader: loaderStatistics,
        },
        {
          path: '/settings',
          element: <Settings />,
          icon: IoMdSettings,
          label: 'route.settings',
        },
      ];

      expect(getLabelAndPrevious('/statistics', routes)).toStrictEqual({
        label: 'route.statistics',
        previous: undefined,
      });
    });

    it('should not return home label', () => {
      const routes: Route[] = [
        {
          path: '/',
          element: <MainLayout />,
          icon: FaPlus,
          label: 'route.new_game',
          children: [
            {
              path: '/',
              element: <NewGame />,
            },
          ],
        },
      ];

      expect(getLabelAndPrevious('/', routes)).toStrictEqual({
        label: 'route.new_game',
        previous: undefined,
      });
    });

    it('should not return children routes', () => {
      const routes: Route[] = [
        {
          path: '/',
          element: <MainLayout />,
          icon: FaPlus,
          label: 'route.new_game',
          children: [
            {
              path: '/',
              element: <NewGame />,
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
            },
          ],
        },
      ];

      expect(getLabelAndPrevious('/players/new', routes)).toStrictEqual({
        label: 'route.new_player',
        previous: true,
      });
    });

    it('should not return dynamic routes', () => {
      const routes: Route[] = [
        {
          path: '/',
          element: <MainLayout />,
          icon: FaPlus,
          label: 'route.new_game',
          children: [
            {
              path: '/',
              element: <NewGame />,
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
            },
          ],
        },
      ];

      expect(getLabelAndPrevious('/players/edit/5', routes)).toStrictEqual({
        label: 'route.edit_player',
        previous: true,
      });
    });
  });

  describe('Method: sum()', () => {
    it('should return 0 of an empty array', () => {
      expect(sum([])).toBe(0);
    });

    it('should return the sum of an array of positive number', () => {
      expect(sum([1, 2, 3])).toBe(6);
    });

    it('should return the sum of an array of negative number', () => {
      expect(sum([-1, -2, -3])).toBe(-6);
    });
    
    it('should a close number of an array of float numbers', () => {
      expect(sum([0.0001, 0.0002, 0.0003])).toBeCloseTo(0.0006, 3);
    });
  });

  describe('Method: avg()', () => {
    it('should return 0 of an empty array', () => {
      expect(avg([])).toBe(0);
    });

    it('should return the avg of an array of positive number', () => {
      expect(avg([1, 2, 3])).toBe(2);
    });

    it('should return the avg of an array of negative number', () => {
      expect(avg([-1, -2, -3])).toBe(-2);
    });

    it('should a close number of an array of float numbers', () => {
      expect(avg([0.0001, 0.0002, 0.0003])).toBeCloseTo(0.0002, 3);
    });
  });

  describe('Method: addValueIntoMin()', () => {
    it('should return an empty array of the input is an empty array', () => {
      expect(addValueIntoMin([], 3)).toStrictEqual([]);
    });

    it('should return an equal array of the mod is equal to 0', () => {
      expect(addValueIntoMin([1, 3, 2], 0)).toStrictEqual([1, 3, 2]);
    });

    it('should increment the minimal number', () => {
      expect(addValueIntoMin([0, 10, 5], 3)).toStrictEqual([3, 10, 5]);
    });

    it('should increment the first minimal number', () => {
      expect(addValueIntoMin([0, 0, 5], 3)).toStrictEqual([3, 0, 5]);
    });
  });

  describe('Method: addValueIntoMax()', () => {
    it('should return an empty array of the input is an empty array', () => {
      expect(addValueIntoMax([], 3)).toStrictEqual([]);
    });

    it('should return an equal array of the mod is equal to 0', () => {
      expect(addValueIntoMax([1, 3, 2], 0)).toStrictEqual([1, 3, 2]);
    });

    it('should increment the maximal number', () => {
      expect(addValueIntoMax([0, 10, 5], 3)).toStrictEqual([0, 13, 5]);
    });

    it('should increment the first maximal number', () => {
      expect(addValueIntoMax([0, 10, 10], 3)).toStrictEqual([0, 13, 10]);
    });
  });

  describe('Method: countScienceScore()', () => {
    it('should return 0 if the player has not scientific symbol', () => {
      expect(countScienceScore(0, 0, 0, 7)).toStrictEqual(0);
    });

    it('should return 10 if the player has 1 of each symbol', () => {
      expect(countScienceScore(1, 1, 1, 7)).toStrictEqual(10);
    });

    it('should return 13 if the player has 2, 1 and 1 symbols', () => {
      expect(countScienceScore(2, 1, 1, 7)).toStrictEqual(13);
    });

    it('should return 26 if the player has 2 of each symbol', () => {
      expect(countScienceScore(2, 2, 2, 7)).toStrictEqual(26);
    });

    it('should return 13 if the player has 1 of each symbol and each triple worth 10 points', () => {
      expect(countScienceScore(1, 1, 1, 10)).toStrictEqual(13);
    });

    it('should return 16 if the player has 2, 1 and 1 symbols and each triple worth 10 points', () => {
      expect(countScienceScore(2, 1, 1, 10)).toStrictEqual(16);
    });

    it('should return 26 if the player has 2 of each symbol and each triple worth 10 points', () => {
      expect(countScienceScore(2, 2, 2, 10)).toStrictEqual(32);
    });
  });
});
