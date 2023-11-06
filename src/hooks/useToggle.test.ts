import { act, renderHook } from '@testing-library/react';
import { useToggle } from './useToggle';

describe('Hook: useToggle()', () => {
  it('should return an array with three elements', () => {
    const { result } = renderHook(() => useToggle());
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBe(3);
  });

  it('should return a boolean as the first element', () => {
    const { result } = renderHook(() => useToggle());
    expect(typeof result.current[0]).toBe('boolean');
  });

  it('should return a function as the second element', () => {
    const { result } = renderHook(() => useToggle());
    expect(typeof result.current[1]).toBe('function');
  });

  it('should set the initial state to false if no default value is provided', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
  });

  it('should set the initial state to true if true is provided', () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
  });

  it('should set the initial state to true if false is provided', () => {
    const { result } = renderHook(() => useToggle(false));
    expect(result.current[0]).toBe(false);
  });

  it('should return undefined when calling the toggle function', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[1]()).toBe(undefined);
  });

  it('should set the value to true when calling the toggle function', () => {
    const { result } = renderHook(() => useToggle());

    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);
  });

  it('should set the value to true when calling the setValue function', () => {
    const { result } = renderHook(() => useToggle());

    act(() => result.current[2](true));
    expect(result.current[0]).toBe(true);
  });

  it('should set the value to false when calling the setValue function', () => {
    const { result } = renderHook(() => useToggle());

    act(() => result.current[2](false));
    expect(result.current[0]).toBe(false);
  });
});
