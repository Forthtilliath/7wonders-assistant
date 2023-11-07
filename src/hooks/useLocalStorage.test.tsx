import { act, renderHook } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('Hook: useLocalStorage', () => {
  const key = 'test_key';

  beforeEach(() => {
    localStorage.removeItem(key);
  });

  it('should initialize with default value when key does not exist in localStorage', () => {
    const defaultValue = 'testValue';
    const { result } = renderHook(() => useLocalStorage(key, defaultValue));

    expect(result.current[0]).toBe(defaultValue);
  });

  it('should update value in localStorage and state when setter is called', () => {
    const defaultValue = 'testValue';
    const { result } = renderHook(() => useLocalStorage(key, defaultValue));

    expect(result.current[0]).toBe(defaultValue);

    const newValue = 'newTestValue';
    act(() => result.current[1](newValue));
    expect(result.current[0]).toBe(newValue);
  });

  it('should remove value from localStorage and state when remove is called', () => {
    const defaultValue = 'testValue';
    const { result } = renderHook(() => useLocalStorage(key, defaultValue));

    expect(result.current[0]).toBe(defaultValue);

    const newValue = 'newTestValue';
    act(() => result.current[1](newValue));
    expect(result.current[0]).toBe(newValue);

    act(() => result.current[2]());
    expect(result.current[0]).toBe(defaultValue);
  });

  it('should accept objects', () => {
    const defaultValue = { connected: false };
    const { result } = renderHook(() => useLocalStorage(key, defaultValue));

    expect(result.current[0].connected).toBe(false);

    const newValue = { connected: true };
    act(() => result.current[1](newValue));
    expect(result.current[0].connected).toBe(true);
  });

  it('should accept numbers', () => {
    const defaultValue = 0;
    const { result } = renderHook(() => useLocalStorage(key, defaultValue));

    expect(result.current[0]).toBe(defaultValue);

    const newValue = 1;
    act(() => result.current[1](newValue));
    expect(result.current[0]).toBe(newValue);
  });

  it('should accept arrays', () => {
    const defaultValue = [1, 2, 3];
    const { result } = renderHook(() => useLocalStorage(key, defaultValue));

    expect(result.current[0]).toStrictEqual(defaultValue);

    const newValue = [...defaultValue, 4];
    act(() => result.current[1](newValue));
    expect(result.current[0]).toStrictEqual(newValue);
  });
});
