import { useParams } from 'react-router-dom';

/**
 * Parses the specified key or keys from the URL parameters and returns an object with the parsed integer values.
 * If the key or any of the keys are not found in the URL parameters, an error is thrown.
 * @param key - The key or keys to extract from the URL parameters.
 * @returns An object with the same keys as the input key (or keys in the array), but with their corresponding values parsed as integers.
 * @throws Error if the key or any of the keys are not found in the URL parameters.
 * @example
 * const params = useParamsInt('id');
 * console.log(params); // { id: 123 }
 *
 * const paramsArray = useParamsInt(['id', 'page']);
 * console.log(paramsArray); // { id: 123, page: 1 }
 */
export function useParamsInt<K extends string>(
  key: K | K[]
): Record<K, number> {
  const params = useParams();

  const arrKeys = Array.isArray(key) ? key : [key];

  return arrKeys.reduce(
    (obj, key) => {
      if (params[key] === undefined) {
        throw new Error(`${key} is undefined`);
      }

      return {
        ...obj,
        [key]: parseInt(params[key] as string, 10),
      };
    },
    {} as Record<K, number>
  );
}
