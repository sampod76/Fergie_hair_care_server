import { z } from 'zod';

import { I_STATUS, STATUS_ARRAY } from '../../../../global/enum_constant_type';
import { UserValidation } from '../user/user.validation';
// const combinedAdminZodData = UserValidation.adminZodData.merge(
//   UserValidation.authData
// );
const combinedAdminZodData = UserValidation.adminZod_BodyData.merge(
  UserValidation.authData.pick({ email: true }),
);
const otherProperties = z.object({
  status: z.enum(STATUS_ARRAY as [I_STATUS, ...I_STATUS[]]).optional(),
  isDelete: z.boolean().optional().default(false),
});

const updateAdminZodSchema = z.object({
  body: combinedAdminZodData.merge(otherProperties).deepPartial(),
});

export const AdminValidation = {
  updateAdminZodSchema,
  combinedAdminZodData,
};
