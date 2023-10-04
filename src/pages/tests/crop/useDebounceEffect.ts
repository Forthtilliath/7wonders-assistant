import { useEffect, DependencyList } from 'react'

export function useDebounceEffect(
  fn: () => void,
  waitTime: number,
  deps: DependencyList = [],
) {
  // const callback = useCallback(fn, deps);

  useEffect(() => {
    // const t = setTimeout(fn, waitTime)

    // return () => {
    //   clearTimeout(t)
    // }
    return createTimeout(fn, waitTime);
  }, [fn, waitTime])
}

function createTimeout(fn: () => void, waitTime: number) {
  const t = setTimeout(fn, waitTime)

  return () => {
    clearTimeout(t)
  }
}