import { capitalize, generateURL, generateVersionObject } from '@helpers';

describe('String methods', () => {
  describe('Method: generateURL()', () => {
    it('should generate a URL with query parameters appended from a FormData object', () => {
      const origin = 'https://example.com';
      const formData = new FormData();
      formData.append('key1', 'value1');
      formData.append('key2', 'value2');
      const expectedURL = 'https://example.com/?key1=value1&key2=value2';

      expect(generateURL(origin, formData)).toBe(expectedURL);
    });

    it('should return an url with identical keys', () => {
      const origin = 'https://example.com';
      const formData = new FormData();
      formData.append('key1', 'value1');
      formData.append('key1', 'value2');
      const expectedURL = 'https://example.com/?key1=value1&key1=value2';

      expect(generateURL(origin, formData)).toBe(expectedURL);
    });

    it('should return a url complementing the existing keys', () => {
      const origin = 'https://example.com?key1=valueA';
      const formData = new FormData();
      formData.append('key1', 'valueB');
      formData.append('key2', 'value2');
      const expectedURL =
        'https://example.com/?key1=valueA&key1=valueB&key2=value2';

      expect(generateURL(origin, formData)).toBe(expectedURL);
    });

    it('should handle special characters in key and value correctly', () => {
      const origin = 'https://example.com';
      const formData = new FormData();
      formData.append('key1', 'value1');
      formData.append('key2', 'value2');
      formData.append('key3', 'special&characters');
      const expectedURL =
        'https://example.com/?key1=value1&key2=value2&key3=special%26characters';

      expect(generateURL(origin, formData)).toBe(expectedURL);
    });

    it('should handle FormData object with empty string values correctly', () => {
      const origin = 'https://example.com';
      const formData = new FormData();
      formData.append('key1', '');
      formData.append('key2', '');
      const expectedURL = 'https://example.com/?key1=&key2=';

      expect(generateURL(origin, formData)).toBe(expectedURL);
    });
  });

  describe('Method: capitalize()', () => {
    it('should capitalize the first character of a string when it is lowercase', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it("should return the input string if it's already capitalized", () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    it('should work with empty strings', () => {
      expect(capitalize('')).toBe('');
    });

    it('should work with strings containing non-ASCII characters', () => {
      expect(capitalize('école')).toBe('École');
    });

    it('should work with strings containing whitespace characters', () => {
      expect(capitalize(' hello world ')).toBe(' hello world ');
    });

    it('should work with strings containing special characters', () => {
      expect(capitalize('@hello!')).toBe('@hello!');
    });
  });

  describe('Method: generateVersionObject()', () => {
    it('should correctly parse a version string with a major, minor, and patch number', () => {
      const versionString = '1.2.3';
      const versionObject = generateVersionObject(versionString);
      expect(versionObject).toEqual({ major: 1, minor: 2, patch: 3 });
    });

    it('should correctly parse a version string with a major number only', () => {
      const versionString = '1';
      const versionObject = generateVersionObject(versionString);
      expect(versionObject).toEqual({ major: 1, minor: 0, patch: 0 });
    });

    it('should correctly parse a version string with a major and minor number only', () => {
      const versionString = '1.2';
      const versionObject = generateVersionObject(versionString);
      expect(versionObject).toEqual({ major: 1, minor: 2, patch: 0 });
    });

    it('should correctly parse a version string with a major and patch number only', () => {
      const versionString = '1..3';
      const versionObject = generateVersionObject(versionString);
      expect(versionObject).toEqual({ major: 1, minor: 0, patch: 3 });
    });
  });
});
