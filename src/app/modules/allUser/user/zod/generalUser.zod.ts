import { z } from 'zod';
import { I_VERIFY, VERIFY_ARRAY } from '../../typesAndConst';
import { ENUM_COMPANY_TYPE } from '../user.constant';

export const ROLE_TYPE_ARRAY = Object.values(ENUM_COMPANY_TYPE);

export const generalUserSchema = z.object({
  country: z
    .object({
      name: z.string({ required_error: 'Country is required' }),
      flag: z.object({ url: z.string().url() }).optional(),
      isoCode: z.string().optional(),
    })
    .optional(),
  verify: z.enum(VERIFY_ARRAY as [I_VERIFY]).optional(),
});
