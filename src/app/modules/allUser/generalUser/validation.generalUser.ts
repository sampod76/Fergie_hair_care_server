import { z } from 'zod';

import { I_STATUS, STATUS_ARRAY } from '../../../../global/enum_constant_type';
import { UserValidation } from '../user/user.validation';
// const combinedBuyerZodData = UserValidation.BuyerZodData.merge(
//   UserValidation.authData
// );
const combinedGeneralUserZodData = UserValidation.generalUserZod_BodyData.merge(
  UserValidation.authData.pick({ email: true }),
);

const zodChildrenObject = z.object({
  label: z
    .string({
      required_error: 'Value is required',
    })
    .optional(),
  value: z.string({
    required_error: 'Value is required',
  }),
  subTitle: z.string().optional(),
  uid: z.string().or(z.string().uuid()).optional(),
});

const otherBodyData = z.object({
  category: z.array(
    zodChildrenObject.merge(
      z.object({
        children: zodChildrenObject.merge(
          z.object({ children: zodChildrenObject }),
        ),
      }),
    ),
  ),
  status: z.enum(STATUS_ARRAY as [I_STATUS]).optional(),
  isDelete: z.boolean().optional(),
});

const updateGeneralUserSchema = z.object({
  body: combinedGeneralUserZodData.merge(otherBodyData).deepPartial(),
});

export const GeneralUserValidation = {
  updateGeneralUserSchema,
  combinedGeneralUserZodData,
  //
  otherBodyData,
};
