import { act } from 'react-dom/test-utils';
import { usePageAnimationStore } from '@/lib';
import { renderHook } from '@testing-library/react';

const initialStoreState = usePageAnimationStore.getState();

describe('Store: pageAnimationStore', () => {
  beforeEach(() => {
    usePageAnimationStore.setState(initialStoreState, true);
  });

  it('should have a default value at false', () => {
    const { result } = renderHook(() => usePageAnimationStore());

    expect(result.current.isPrevious).toBe(false);
    expectTypeOf(result.current.setIsPrevious).toBeFunction();
  });

  it('should set the value to true', () => {
    const { result } = renderHook(() => usePageAnimationStore());

    act(() => {
      result.current.setIsPrevious(true);
    });
    expect(result.current.isPrevious).toBe(true);
  });
});
