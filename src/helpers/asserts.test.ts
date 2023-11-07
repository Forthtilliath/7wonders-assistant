import { assertsIsDefined } from '@helpers';

describe('Arrays methods', () => {
  describe('Method: assertsIsDefined()', () => {
    it('should return void if the value is a boolean', () => {
      expect(() => assertsIsDefined(true)).not.toThrow();
      expectTypeOf(assertsIsDefined<boolean>).asserts.toBeBoolean();
    });

    it('should return void if the value is a string', () => {
      expect(() => assertsIsDefined('text')).not.toThrow();
      expectTypeOf(assertsIsDefined<string>).asserts.toBeString();
    });

    it('should return void if the value is an number', () => {
      expect(() => assertsIsDefined(10)).not.toThrow();
      expectTypeOf(assertsIsDefined<number>).asserts.toBeNumber();
    });

    it('should return void if the value is an array', () => {
      expect(() => assertsIsDefined([1, 2, 3])).not.toThrow();
      expectTypeOf(assertsIsDefined<number[]>).asserts.toBeArray();
    });

    it('should return void if the value is an object', () => {
      expect(() => assertsIsDefined({ test: true })).not.toThrow();
      expectTypeOf(assertsIsDefined<{ test: number }>).asserts.toBeObject();
    });

    it('should return void if the value is an function', () => {
      expect(() => assertsIsDefined(() => {})).not.toThrow();
      expectTypeOf(assertsIsDefined<() => void>).asserts.toBeFunction();
    });

    it('should throw an error if the value is null', () => {
      expect(() => assertsIsDefined(null)).toThrow('Variable is not defined');
    });

    it('should throw an error if the value is undefined', () => {
      expect(() => assertsIsDefined(undefined)).toThrow(
        'Variable is not defined'
      );
    });

    it('should throw a custom error if the value is null', () => {
      expect(() =>
        assertsIsDefined(null, 'Value is null or undefined')
      ).toThrow('Value is null or undefined');
    });

    it('should throw the default error if the errorMessage is empty', () => {
      expect(() => assertsIsDefined(null, '')).toThrow(
        'Variable is not defined'
      );
    });
  });
});
