import {
  calculateScores,
  calculateScoreSolo,
  calculateScoreTriplet,
  countScienceScore,
} from './science';

describe('Science methods', () => {
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

    it('should return 0 if wheel value is negative', () => {
      expect(countScienceScore(-2, 2, 2, 7)).toStrictEqual(0);
    });

    it('should return 0 if tablet value is negative', () => {
      expect(countScienceScore(2, -2, 2, 7)).toStrictEqual(0);
    });

    it('should return 0 if compass value is negative', () => {
      expect(countScienceScore(2, -2, 2, 7)).toStrictEqual(0);
    });
  });

  describe('Method: calculateScoreSolo()', () => {
    it('should calculate the score for a single science symbol with positive values for all parameters', () => {
      const result = calculateScoreSolo({
        wheel: 2,
        tablet: 4,
        compass: 1,
        all: 2,
      });
      expect(result).toBe(48);
    });

    it('should calculate the score for a single science symbol with zero values for all parameters', () => {
      const result = calculateScoreSolo({
        wheel: 0,
        tablet: 0,
        compass: 0,
        all: 0,
      });
      expect(result).toBe(0);
    });

    it('should calculate the score for a single science symbol with the same value for all parameters', () => {
      const result = calculateScoreSolo({
        wheel: 3,
        tablet: 3,
        compass: 3,
        all: 3,
      });
      expect(result).toBe(75);
    });

    it('should return 0 if wheel value is negative', () => {
      const result = calculateScoreSolo({
        wheel: -2,
        tablet: 4,
        compass: 1,
        all: 2,
      });
      expect(result).toBe(0);
    });

    it('should return 0 if tablet value is negative', () => {
      const result = calculateScoreSolo({
        wheel: 2,
        tablet: -4,
        compass: 1,
        all: 2,
      });
      expect(result).toBe(0);
    });

    it('should return 0 if compass value is negative', () => {
      const result = calculateScoreSolo({
        wheel: 2,
        tablet: 4,
        compass: -1,
        all: 2,
      });
      expect(result).toBe(0);
    });
  });

  describe('Method: calculateScoreTriplet()', () => {
    it('should return the correct score for a triplet of science symbols with default values', () => {
      const score = calculateScoreTriplet({
        wheel: 0,
        tablet: 0,
        compass: 0,
        all: 0,
      });
      expect(score).toBe(0);
    });

    it('should return the correct score for a triplet of science symbols with different values', () => {
      const score = calculateScoreTriplet({
        wheel: 2,
        tablet: 3,
        compass: 1,
        all: 3,
      });
      expect(score).toBe(48);
    });

    it('should return 0 if any of the input values is not a positive integer', () => {
      const score = calculateScoreTriplet({
        wheel: 2,
        tablet: -3,
        compass: 1,
        all: 3,
      });
      expect(score).toBe(0);
    });

    it('should return the correct score for a triplet of science symbols with the minimum possible values', () => {
      const score = calculateScoreTriplet({
        wheel: 1,
        tablet: 1,
        compass: 1,
        all: 1,
      });
      expect(score).toBe(13);
    });
  });

  describe('Method: calculateScores()', () => {
    it('should calculate maximum score between score calculated using `calculateScoreSolo` and score calculated using `calculateScoreTriplet` methods', () => {
      const symbols = {
        wheel: '1',
        tablet: '2',
        compass: '3',
        most: '2',
        all: '3',
      };

      const result = calculateScores(symbols);

      expect(result).toBe(76);
    });

    it('should return 0 if any of the input values is negative', () => {
      const symbols = {
        wheel: '-2',
        tablet: '3',
        compass: '4',
        most: '5',
        all: '6',
      };

      const result = calculateScores(symbols);

      expect(result).toBe(0);
    });

    it('should calculate maximum score with truncate numbers if any of the input values is decimal', () => {
      const symbols = {
        wheel: '1',
        tablet: '2.5',
        compass: '3',
        most: '2',
        all: '3',
      };

      const result = calculateScores(symbols);

      expect(result).toBe(76);
    });

    it('should return 0 if any of the input values is not provided', () => {
      const symbols = {
        wheel: '2',
        tablet: '3',
        compass: '4',
        all: '6',
      };

      // @ts-expect-error "All values not provided"
      const result = calculateScores(symbols);

      expect(result).toBe(0);
    });
  });
});
