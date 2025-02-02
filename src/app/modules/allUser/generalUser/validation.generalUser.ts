import { z } from 'zod';

import { I_STATUS, STATUS_ARRAY } from '../../../../global/enum_constant_type';
import { UserValidation } from '../user/user.validation';
// const combinedBuyerZodData = UserValidation.BuyerZodData.merge(
//   UserValidation.authData
// );
const combinedGeneralUserZodData = UserValidation.generalUserZod_BodyData.merge(
  UserValidation.authData.pick({ email: true }),
);
const otherProperties = z.object({
  status: z.enum(STATUS_ARRAY as [I_STATUS]).optional(),
  isDelete: z.boolean().optional().default(false),
});

const updateGeneralUserSchema = z.object({
  body: combinedGeneralUserZodData.merge(otherProperties).deepPartial(),
});

export const GeneralUserValidation = {
  updateGeneralUserSchema,
  combinedGeneralUserZodData,
};
