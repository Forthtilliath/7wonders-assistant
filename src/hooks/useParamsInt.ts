import { useParams } from 'react-router-dom';

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
