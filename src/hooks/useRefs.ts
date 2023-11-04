import { useRef } from 'react';

export function useRefs<T extends HTMLElement = HTMLElement>() {
  const refsByKey = useRef<Record<PropertyKey, T | null>>({});

  const setRef = (key: PropertyKey) => (element: T | null) => {
    refsByKey.current[key] = element;
    return element
  };

  return [refsByKey.current, setRef] as const;
}
