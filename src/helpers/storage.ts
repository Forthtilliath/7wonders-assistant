/**
 * Retrieves a value from the browser's local storage based on a given key.
 * If the value is not found, it returns a default value provided by the user.
 * @param key - The key used to retrieve the value from the local storage.
 * @param defaultValue - The default value to be returned if the key is not found in the local storage.
 * @returns The value stored in the local storage with the given key, or the provided default value if the key is not found.
 */
export function getLocalStorage(key: string, defaultValue: unknown) {
  const storedValue = localStorage.getItem(key);
  if (storedValue !== null) {
    return JSON.parse(storedValue);
  }
  return JSON.parse(JSON.stringify(defaultValue));
}
