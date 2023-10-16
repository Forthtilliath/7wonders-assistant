/**
 * Filters an object based on an array of keys and returns a new object
 * that contains only the key-value pairs from the original object that match the provided keys.
 * @param obj - The object to filter.
 * @param keys - The keys to filter the object.
 * @returns The filtered object that contains only the key-value pairs from the original object that match the provided keys.
 */
export function filterKeys<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result: Partial<Pick<T, K>> = {};

  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }

  return result as Pick<T, K>;
}
