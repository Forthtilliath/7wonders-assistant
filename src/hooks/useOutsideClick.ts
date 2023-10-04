import { useEffect, useRef } from "react";

export const useOutsideClick = <T extends HTMLElement>(callback: () => void) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.body.addEventListener("click", handleClickOutside, true);

    return () => {
      document.body.removeEventListener("click", handleClickOutside, true);
    };
  }, [callback]);

  return ref;
};
