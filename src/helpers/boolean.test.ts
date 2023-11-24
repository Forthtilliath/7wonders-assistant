import { Data } from '@lib/zodSchemas';
import {
  isInteger,
  isNegative,
  isNumber,
  isPositive,
  isPositiveInteger,
  isVersion,
} from '@helpers';

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

  describe('Method: isNumber()', () => {
    it('should return true when the value is a positive integer', () => {
      const result = isNumber(5);
      expect(result).toBe(true);
    });

    it('should return true when the value is a negative integer', () => {
      const result = isNumber(-5);
      expect(result).toBe(true);
    });

    it('should return true when the value is zero', () => {
      const result = isNumber(0);
      expect(result).toBe(true);
    });

    it('should return false when the value is undefined', () => {
      const result = isNumber(undefined);
      expect(result).toBe(false);
    });

    it('should return false when the value is null', () => {
      const result = isNumber(null);
      expect(result).toBe(false);
    });

    it('should return false when the value is an empty string', () => {
      const result = isNumber('');
      expect(result).toBe(false);
    });

    it('should return false when the value is an NaN', () => {
      const result = isNumber(NaN);
      expect(result).toBe(false);
    });
  });

  describe('Method: isInteger()', () => {
    it('should return true when the value is an integer number', () => {
      const result = isInteger(5);
      expect(result).toBe(true);
    });

    it('should return false when the value is a non-integer number', () => {
      const result = isInteger(5.5);
      expect(result).toBe(false);
    });

    it('should return false when the value is NaN', () => {
      const result = isInteger(NaN);
      expect(result).toBe(false);
    });

    it('should return false when the value is Number.MAX_VALUE', () => {
      const result = isInteger(Number.MAX_VALUE);
      expect(result).toBe(true);
    });

    it('should return false when the value is Number.MIN_VALUE', () => {
      const result = isInteger(Number.MIN_VALUE);
      expect(result).toBe(false);
    });

    it('should return false when the value is Number.NaN', () => {
      const result = isInteger(Number.NaN);
      expect(result).toBe(false);
    });
  });

  describe('Method: isNegative()', () => {
    it('should return true when the input is a negative number', () => {
      const result = isNegative(-5);
      expect(result).toBe(true);
    });

    it('should return false when the input is zero', () => {
      const result = isNegative(0);
      expect(result).toBe(false);
    });

    it('should return false when the input is a positive number', () => {
      const result = isNegative(5);
      expect(result).toBe(false);
    });

    it('should return false when the input is negative zero', () => {
      const result = isNegative(-0);
      expect(result).toBe(false);
    });

    it('should return false when the input is NaN', () => {
      const result = isNegative(NaN);
      expect(result).toBe(false);
    });

    it('should return false when the input is undefined', () => {
      // @ts-expect-error "Test invalid type"
      const result = isNegative(undefined);
      expect(result).toBe(false);
    });

    it('should return false when the input is null', () => {
      // @ts-expect-error "Test invalid type"
      const result = isNegative(null);
      expect(result).toBe(false);
    });
  });

  describe('Method: isPositive()', () => {
    it('should return true when the input is a positive integer', () => {
      const result = isPositive(5);
      expect(result).toBe(true);
    });

    it('should return true when the input is a positive float', () => {
      const result = isPositive(3.14);
      expect(result).toBe(true);
    });

    it('should return true when the input is zero', () => {
      const result = isPositive(0);
      expect(result).toBe(true);
    });

    it('should return false when the input is NaN', () => {
      const result = isPositive(NaN);
      expect(result).toBe(false);
    });

    it('should return false when the input is Infinity', () => {
      const result = isPositive(Infinity);
      expect(result).toBe(false);
    });

    it('should return false when the input is -Infinity', () => {
      const result = isPositive(-Infinity);
      expect(result).toBe(false);
    });
  });

  describe('Method: isPositiveInteger()', () => {
    it('should return true when the input is a positive integer', () => {
      const result = isPositiveInteger(5);
      expect(result).toBe(true);
    });

    it('should return false when the input is a negative integer', () => {
      const result = isPositiveInteger(-5);
      expect(result).toBe(false);
    });

    it('should return false when the input is a non-integer', () => {
      const result = isPositiveInteger(5.5);
      expect(result).toBe(false);
    });

    it('should return true when the input is the maximum safe integer value', () => {
      const result = isPositiveInteger(Number.MAX_SAFE_INTEGER);
      expect(result).toBe(true);
    });

    it('should return false when the input is the minimum safe integer value', () => {
      const result = isPositiveInteger(Number.MIN_SAFE_INTEGER);
      expect(result).toBe(false);
    });

    it('should return false when the input is Infinity', () => {
      const result = isPositiveInteger(Infinity);
      expect(result).toBe(false);
    });
  });
});
