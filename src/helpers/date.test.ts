import { formatDate } from '@helpers';

describe('Date methods', () => {
  describe('Method: formatDate', () => {
    it('should return a formatted date string with year, month and day when given a valid timestamp', () => {
      const timestamp = 1635724800000; // November 1, 2021
      expect(formatDate(timestamp)).toBe('1 novembre 2021');
    });

    it('should return a formatted date string with year, month and day in the specified locale when given a valid timestamp and locale', () => {
      const timestamp = 1635724800000; // November 1, 2021
      expect(formatDate(timestamp, 'en-US')).toBe('November 1, 2021');
    });

    it('should return a formatted date string with year, month and day in the specified locale when given a valid timestamp and locale', () => {
      const timestamp = 1635724800000; // November 1, 2021
      expect(formatDate(timestamp, 'fr-FR')).toBe('1 novembre 2021');
    });

    it('should return a formatted date string with year, month and day when given a timestamp that is the minimum allowed value', () => {
      const timestamp = -8640000000000000; // Minimum allowed timestamp
      expect(formatDate(timestamp)).toBe('20 avril 271822');
    });

    it('should return a formatted date string with year, month and day when given a timestamp that is the maximum allowed value', () => {
      const timestamp = 8640000000000000; // Maximum allowed timestamp
      expect(formatDate(timestamp)).toBe('13 septembre 275760');
    });
  });
});
