import { Data } from '@lib/zodSchemas';

export function isVersion<V extends keyof Data>(
  data: Data[keyof Data],
  version: V
): data is Data[V] {
  return data?.settings?.version === version;
}
