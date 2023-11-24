import { removeLandingZero } from './number';

describe('Object methods', () => {
  describe('Method: removeLandingZero()', () => {
    it('should remove leading zeros from a positive integer and return a string representation', () => {
      const result = removeLandingZero(+'00123');
      expect(result).toBe('123');
    });

    it('should remove leading zeros from a decimal and return a string representation', () => {
      const result = removeLandingZero(+'0.00123');
      expect(result).toBe('.00123');
    });

    it('should remove only the leading zeros from a number with only zeros', () => {
      // eslint no-octal: "error"
      const result = removeLandingZero(+'0000');
      expect(result).toBe('0');
    });

    it('should remove only the leading zeros from a number with a single non-zero digit', () => {
      const result = removeLandingZero(+'00001');
      expect(result).toBe('1');
    });

    it('should return the default value as a string if the input value is 0000', () => {
      const result = removeLandingZero(+'0000', 5);
      expect(result).toBe('5');
    });

    it('should throw an error if the input value is NaN', () => {
      expect(() => removeLandingZero(NaN, 5)).toThrow(
        'Invalid input. The value NaN must be a number.'
      );
    });
  });
});
