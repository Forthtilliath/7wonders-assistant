import { filterKeys } from '@/helpers';

describe('Object methods', () => {
  describe('Method: filterKeys()', () => {
    it('should return an object with only the key-value pairs that match the provided keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(filterKeys(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });

    it('should return an empty object if the provided keys array is empty', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(filterKeys(obj, [])).toEqual({});
    });

    it('should handle an object with undefined values and return an object with only the defined values', () => {
      const obj = { a: undefined, b: 2, c: undefined };
      expect(filterKeys(obj, ['a', 'b', 'c'])).toEqual({ b: 2 });
    });

    it('should handle an object with null values and return an object with all null values', () => {
      const obj = { a: null, b: 2, c: null };
      const expected = { a: null, b: 2, c: null };
      expect(filterKeys(obj, ['a', 'b', 'c'])).toEqual(expected);
    });
  });
});
