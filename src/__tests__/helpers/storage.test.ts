import { getLocalStorage, setLocalStorage } from '@helpers';

const key = 'test_key';

describe('File methods', () => {
  describe('Method: getLocalStorage()', () => {
    beforeEach(() => {
      localStorage.removeItem(key);
    });

    it('should retrieve value from local storage when key exists', () => {
      const value = 'testValue';
      localStorage.setItem(key, JSON.stringify(value));

      const result = getLocalStorage<string>(key, '');

      expect(result).toBe(value);
    });

    it('should return default value when key not found in local storage', () => {
      const defaultValue = 'defaultValue';

      const result = getLocalStorage<string>(key, defaultValue);

      expect(result).toBe(defaultValue);
    });

    it('should return value of any type stored in local storage', () => {
      const value = { name: 'John', age: 25 };
      localStorage.setItem(key, JSON.stringify(value));

      const result = getLocalStorage<object>(key, {});

      expect(result).toEqual(value);
    });

    it('should handle null default value', () => {
      const defaultValue = null;

      const result = getLocalStorage<string>(key, defaultValue);

      expect(result).toBe(defaultValue);
    });

    it('should handle null value stored in local storage', () => {
      const value = null;
      localStorage.setItem(key, JSON.stringify(value));

      const result = getLocalStorage<string>(key, '');

      expect(result).toBe(value);
    });
  });

  describe('Method: getLocalStorage()', () => {
    beforeEach(() => {
      localStorage.removeItem(key);
    });

    it('should set a value in local storage when given a key and value', () => {
      const value = 'testValue';

      setLocalStorage(key, value);

      expect(localStorage.getItem(key)).toBe(JSON.stringify(value));
    });

    it('should dispatch a storage event with the key', () => {
      const value = 'testValue';

      const dispatchEventSpy = vi
        .spyOn(window, 'dispatchEvent')
        .mockImplementation(() => true);

      setLocalStorage(key, value);

      const event = dispatchEventSpy.mock.calls[0][0] as StorageEvent;

      expect(event.type).toBe('storage');
      expect(event.key).toBe(key);
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle any type of value by converting it to a string using JSON.stringify', () => {
      const value = { name: 'John', age: 30 };

      setLocalStorage(key, value);

      expect(localStorage.getItem(key)).toBe(JSON.stringify(value));
    });

    it('should stringify value even if the value is null', () => {
      setLocalStorage(key, null);
      expect(localStorage.getItem(key)).toBe('null');
    });

    // If the value cannot be stringified using JSON.stringify, it throws an error.
    it('should throw an error if the value cannot be stringified using JSON.stringify', () => {
      const value = { circularReference: {} };
      value.circularReference = value;

      expect(() => {
        setLocalStorage(key, value);
      }).toThrow();
    });
  });
});
