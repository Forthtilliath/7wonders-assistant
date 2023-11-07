import { render, renderHook } from '@/__tests__/tests-utils';
import { useRefs } from './useRefs';

describe('Hook: useRefs()', () => {
  it('should return an array of 2 elements, first is an object, second is a function', () => {
    const { result } = renderHook(() => useRefs<HTMLInputElement>());

    expect(result.current.length).toBe(2);
    expectTypeOf(result.current[0]).toBeObject();
    expectTypeOf(result.current[1]).toBeFunction();
    expect(result.current[0]).toEqual({});
  });

  it('should have a first value which return an object with three elements', () => {
    const { result } = renderHook(() => useRefs<HTMLInputElement>());

    const Comp = () => {
      return (
        <form>
          {[...Array(3)].map((_, i) => (
            <input key={i} ref={result.current[1](i)} />
          ))}
        </form>
      );
    };

    render(<Comp />);
    expect(Object.keys(result.current[0]).length).toBe(3);
  });

  it('should have a first value which contains keys affected', () => {
    const { result } = renderHook(() => useRefs<HTMLInputElement>());

    const Comp = () => {
      return (
        <form>
          {[...Array(3)].map((_, i) => (
            <input
              type="number"
              key={i}
              ref={result.current[1](`input-${i}`)}
              defaultValue={i * 3}
            />
          ))}
        </form>
      );
    };

    render(<Comp />);

    expect(result.current[0]['input-0']?.valueAsNumber).toBe(0);
    expect(result.current[0]['input-1']?.valueAsNumber).toBe(3);
    expect(result.current[0]['input-2']?.valueAsNumber).toBe(6);
  });
});
