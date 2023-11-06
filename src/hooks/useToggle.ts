import { Dispatch, SetStateAction, useCallback, useState } from 'react';

/**
 * Custom hook that returns an array with three elements: the current value of a boolean state,
 * a function to toggle the state value, and a function to update the state value.
 *
 * @param defaultValue - The initial value of the boolean state. Defaults to `false`.
 * @returns An array with three elements:
 *   - The current value of the boolean state.
 *   - A function to toggle the state value.
 *   - A function to update the state value.
 */
export function useToggle(
  defaultValue = false
): [boolean, () => void, Dispatch<SetStateAction<boolean>>] {
  const [value, setValue] = useState(defaultValue);

  const toggle = useCallback(() => setValue((x) => !x), []);

  return [value, toggle, setValue];
}
