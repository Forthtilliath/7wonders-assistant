import { z } from 'zod';
import { dataSchema_v0_1_0 } from './schema_0.1.0';
import { dataSchema_v0_2_0 } from './schema_0.2.0';
import { dataSchema_v0_3_0 } from './schema_0.3.0';

export const dataSchema = {
  '0.1.0': dataSchema_v0_1_0,
  '0.2.0': dataSchema_v0_2_0,
  '0.3.0': dataSchema_v0_3_0,
};

export type Data = {
  '0.1.0': z.infer<typeof dataSchema_v0_1_0>;
  '0.2.0': z.infer<typeof dataSchema_v0_2_0>;
  '0.3.0': z.infer<typeof dataSchema_v0_3_0>;
};
