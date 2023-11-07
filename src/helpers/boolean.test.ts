import { Data } from '@lib/zodSchemas';
import { isVersion } from '@helpers';

describe('Boolean methods', () => {
  describe('Method: isVersion()', () => {
    it('should return true when the version in the data matches the provided version', () => {
      const data: Data['0.1.0'] = {
        settings: {
          extensions: [],
          version: '0.1.0',
          language: 'fr',
        },
        players: [],
        history: [],
      };
      expect(isVersion(data, '0.1.0')).toBe(true);
    });

    it('should return true when the version in the data matches the provided version', () => {
      const data: Data['0.1.0'] = {
        settings: {
          extensions: [],
          version: '0.1.0',
          language: 'fr',
        },
        players: [],
        history: [],
      };
      expect(isVersion(data, '0.2.0')).toBe(false);
    });
  });
});
