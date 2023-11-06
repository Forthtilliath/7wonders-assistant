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

    it(' flatten a simple route with icon, label, and path', () => {
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

    it('should flatten a route with nested children', () => {
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
              icon: GiMeeple,
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
        { icon: GiMeeple, label: 'route.new_player', path: '/players/new' },
      ];

      expect(flattenRoutes(routes)).toStrictEqual(expectedRoutes);
    });

    it('should flatten a route with nested children', () => {
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
              icon: GiMeeple,
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
        { icon: GiMeeple, label: 'route.new_player', path: '/players/new' },
      ];

      expect(flattenRoutes(routes)).toStrictEqual(expectedRoutes);
    });

    it('should flatten multiple routes with different depths and structures', () => {
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
              icon: GiMeeple,
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
        { icon: GiMeeple, label: 'route.new_player', path: '/players/new' },
      ];

      expect(flattenRoutes(routes)).toStrictEqual(expectedRoutes);
    });

    it('should ignore a route without icon, label, or path', () => {
      const routes: Route[] = [
        {
          path: '/settings',
          element: <Settings />,
          label: 'route.settings',
        },
      ];

      expect(flattenRoutes(routes)).toEqual([]);
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
      expect(sum([1, 2, 3, 4, 5])).toBe(15);
    });

    it('should return the sum of an array of negative number', () => {
      expect(sum([-1, -2, -3, -4, -5])).toBe(-15);
    });

    it('should a close number of an array of float numbers', () => {
      expect(sum([0.0001, 0.0002, 0.0003])).toBeCloseTo(0.0006, 3);
    });

    it('should return 0 when array contains only zeros', () => {
      expect(sum([0, 0, 0, 0, 0])).toBe(0);
    });

    it('should return the correct sum for an array with a large number of elements', () => {
      const numbers = Array.from({ length: 100000 }, (_, i) => i + 1);
      const result = sum(numbers);
      expect(result).toBe(5000050000);
    });

    it('should return the correct sum for an array with very large numbers', () => {
      const numbers = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
      const result = sum(numbers);
      expect(result).toBe(2 * Number.MAX_SAFE_INTEGER);
    });
  });

  describe('Method: avg()', () => {
    it('should return 0 of an empty array', () => {
      expect(avg([])).toBe(0);
    });

    it('should return the correct average for an array of positive integers', () => {
      expect(avg([1, 2, 3, 4, 5])).toBe(3);
    });

    it('should return the correct average for an array of negative integers', () => {
      expect(avg([-1, -2, -3, -4, -5])).toBe(-3);
    });

    it('should return the correct average for an array of mixed positive and negative integers', () => {
      expect(avg([-1, 2, -3, 4, -5])).toBe(-0.6);
    });

    it('should return the correct average for an array with only one element', () => {
      expect(avg([5])).toBe(5);
    });

    it('should a close number of an array of float numbers', () => {
      expect(avg([0.0001, 0.0002, 0.0003])).toBeCloseTo(0.0002, 3);
    });

    it('should handle very large arrays without crashing or slowing down significantly', () => {
      const numbers = Array.from({ length: 1000000 }, (_, i) => i + 1);
      expect(avg(numbers)).toBe(500000.5);
    });

    it('should handle very large numbers without overflowing or returning NaN', () => {
      const numbers = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
      expect(avg(numbers)).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe('Method: addValueIntoMin()', () => {
    it('should return an empty array of the input is an empty array', () => {
      expect(addValueIntoMin([], 3)).toStrictEqual([]);
    });

    it('should return the input array with the minimum value incremented by the input value', () => {
      expect(addValueIntoMin([1, 3, 2, 4], 1)).toStrictEqual([2, 3, 2, 4]);
    });

    it('should return the input array with the minimum value incremented by the input value, even if the minimum value is negative', () => {
      expect(addValueIntoMin([-4, -3, -2, -1], 1)).toEqual([-3, -3, -2, -1]);
    });

    it('should return the input array with the minimum value incremented by the input value', () => {
      expect(addValueIntoMin([0, 10, 5, 4], 3)).toStrictEqual([3, 10, 5, 4]);
    });

    it('should return a new array with the same values as the input array, if the input array has duplicate minimum values', () => {
      expect(addValueIntoMin([0, 0, 5, 4], 3)).toStrictEqual([3, 0, 5, 4]);
    });

    it('should return a new array with the same values as the input array, if the input array is not modified', () => {
      expect(addValueIntoMin([1, 2, 3, 4], 0)).toStrictEqual([1, 2, 3, 4]);
    });

    it('should return a new array with the same values as the input array, if the input array is modified', () => {
      const arr = [1, 2, 3, 4, 5];
      const mod = 1;
      const expected = [2, 2, 3, 4, 5];

      const result = addValueIntoMin(arr, mod);

      expect(result).toEqual(expected);
      expect(result).not.toBe(arr);
    });
  });

  describe('Method: addValueIntoMax()', () => {
    it('should return an empty array of the input is an empty array', () => {
      expect(addValueIntoMax([], 3)).toStrictEqual([]);
    });

    it('should return the input array with the maximum value incremented by the input value', () => {
      expect(addValueIntoMax([1, 3, 2, 4], 1)).toStrictEqual([1, 3, 2, 5]);
    });

    it('should return the input array with the maximum value incremented by the input value, even if the maximum value is negative', () => {
      expect(addValueIntoMax([-4, -3, -2, -1], 1)).toEqual([-4, -3, -2, 0]);
    });

    it('should return the input array with the maximum value incremented by the input value', () => {
      expect(addValueIntoMax([0, -10, -5, -4], 3)).toStrictEqual([
        3, -10, -5, -4,
      ]);
    });

    it('should return a new array with the same values as the input array, if the input array has duplicate maximum values', () => {
      expect(addValueIntoMax([0, 1, 4, 4], 3)).toStrictEqual([0, 1, 7, 4]);
    });

    it('should return a new array with the same values as the input array, if the input array is not modified', () => {
      expect(addValueIntoMax([1, 2, 3, 4], 0)).toStrictEqual([1, 2, 3, 4]);
    });

    it('should return a new array with the same values as the input array, if the input array is modified', () => {
      const arr = [1, 2, 3, 4, 5];
      const mod = 1;
      const expected = [1, 2, 3, 4, 6];

      const result = addValueIntoMax(arr, mod);

      expect(result).toEqual(expected);
      expect(result).not.toBe(arr);
    });
  });

  // describe('Method: addValueIntoMax()', () => {
  //   it('should return an empty array of the input is an empty array', () => {
  //     expect(addValueIntoMax([], 3)).toStrictEqual([]);
  //   });

  //   it('should return an equal array of the mod is equal to 0', () => {
  //     expect(addValueIntoMax([1, 3, 2], 0)).toStrictEqual([1, 3, 2]);
  //   });

  //   it('should increment the maximal number', () => {
  //     expect(addValueIntoMax([0, 10, 5], 3)).toStrictEqual([0, 13, 5]);
  //   });

  //   it('should increment the first maximal number', () => {
  //     expect(addValueIntoMax([0, 10, 10], 3)).toStrictEqual([0, 13, 10]);
  //   });
  // });

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
