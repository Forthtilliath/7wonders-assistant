import { useEffect, useState } from "react";

// https://gist.github.com/Mon4ik/2636100f5b74ee14e35cf283700616fe
export function useLocalStorage<T>(key: string, defaultValue: T):[value:T, setter:(value: T) => void, remove:() => void] {
  const [value, _setValue] = useState(defaultValue);

  useEffect(() => {
    function handler(e: StorageEvent) {
      if (e.key !== key) return;

      const item = localStorage.getItem(key);
      if (!item) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
      }

      _setValue(item ? JSON.parse(item) : defaultValue);
    }

    window.addEventListener("storage", handler);

    window.dispatchEvent(new StorageEvent("storage", { key }));

    return () => {
      window.removeEventListener("storage", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setValue = (value: T) => {
    try {
      _setValue(value);

      localStorage.setItem(key, JSON.stringify(value));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new StorageEvent("storage", { key }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeStorage = () => {
    localStorage.removeItem(key);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new StorageEvent("storage", { key }));
    }
  };

  return [value, setValue, removeStorage];
}
