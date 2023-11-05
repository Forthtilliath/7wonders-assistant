/**
 * Retrieves a value from the browser's local storage based on a given key.
 * If the value is not found, it returns a default value provided by the user.
 * @param key - The key used to retrieve the value from the local storage.
 * @param defaultValue - The default value to be returned if the key is not found in the local storage.
 * @returns The value stored in the local storage with the given key, or the provided default value if the key is not found.
 */
export function getLocalStorage<T = unknown>(key: string, defaultValue: unknown) {
  const storedValue = localStorage.getItem(key);
  if (storedValue !== null) {
    return JSON.parse(storedValue) as T;
  }
  return JSON.parse(JSON.stringify(defaultValue)) as T;
}

/**
 * Sets a value in the browser's local storage based on a given key. It
 * also call a dispatch event to update everywhere it's listening.
 *
 * @param key - The key used to identify the value in the local storage.
 * @param value - The value to be stored in the local storage.
 * @returns None.
 */
export function setLocalStorage(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new StorageEvent('storage', { key }));
}
