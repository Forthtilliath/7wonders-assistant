import { renderWithRouter } from '@/__tests__/tests-utils';
import { useParamsInt } from './useParamsInt';

describe('Hook: useParamsInt()', () => {
  it('should return an object with the same keys as the input key', () => {
    const Comp = () => {
      const params = useParamsInt('idPlayer');
      expect(params).toEqual({ idPlayer: expect.any(Number) });
      return null;
    };

    renderWithRouter({
      element: <Comp />,
      initialEntries: ['/player/1'],
      path: 'player/:idPlayer',
    });
  });

  it('should correctly parse integer values from URL parameters', () => {
    const Comp = () => {
      const { idPlayer } = useParamsInt('idPlayer');
      expect(idPlayer).toBe(1);
      return null;
    };

    renderWithRouter({
      element: <Comp />,
      initialEntries: ['/player/1'],
      path: 'player/:idPlayer',
    });
  });

  it('should work correctly with a single key', () => {
    const Comp = () => {
      const params = useParamsInt('id');
      expect(params).toEqual({ id: expect.any(Number) });
      return null;
    };

    renderWithRouter({
      element: <Comp />,
      initialEntries: ['/user/1/57'],
      path: 'user/:id/:likes',
    });
  });

  it('should work correctly with an array of keys', () => {
    const Comp = () => {
      const params = useParamsInt(['id', 'likes']);
      expect(params).toEqual({
        id: expect.any(Number),
        likes: expect.any(Number),
      });
      return null;
    };

    renderWithRouter({
      element: <Comp />,
      initialEntries: ['/user/1/57'],
      path: 'user/:id/:likes',
    });
  });

  it('should throw an error if the key is not found in the URL parameters', () => {
    const Comp = () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      expect(() => useParamsInt('idUser')).toThrow('idUser is undefined');

      return null;
    };

    renderWithRouter({
      element: <Comp />,
      initialEntries: ['/user/1/57'],
      path: 'user/:id/:likes',
    });
  });

  it('should throw an error if any of the keys in the array are not found in the URL parameters', () => {
    const Comp = () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      expect(() => useParamsInt(['id', 'countLikes'])).toThrow(
        'countLikes is undefined'
      );
      return null;
    };

    renderWithRouter({
      element: <Comp />,
      initialEntries: ['/user/1/57'],
      path: 'user/:id/:likes',
    });
  });

  it('should throw an error if the value of the key in the URL parameters is not a valid integer', () => {
    const Comp = () => {
      const params = useParamsInt('slug');
      expect(params).toEqual({ slug: NaN });
      return null;
    };

    renderWithRouter({
      element: <Comp />,
      initialEntries: ['/blog/my-test'],
      path: 'blog/:slug',
    });
  });
});
