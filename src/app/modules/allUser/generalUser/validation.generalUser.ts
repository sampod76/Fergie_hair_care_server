import { z } from 'zod';

import { I_STATUS, STATUS_ARRAY } from '../../../../global/enum_constant_type';
import { UserValidation } from '../user/user.validation';
// const combinedBuyerZodData = UserValidation.BuyerZodData.merge(
//   UserValidation.authData
// );
const combinedGeneralUserZodData = UserValidation.generalUserZod_BodyData.merge(
  UserValidation.authData.pick({ email: true }),
);

export const zodCategoryChildrenObject = z.object({
  label: z.string().optional(),
  value: z.string({
    required_error: 'Value is required',
  }),
  subTitle: z.string().optional(),
  uid: z.string().or(z.string().uuid()),
});

const otherBodyData = z.object({
  category: z.array(
    zodCategoryChildrenObject.merge(
      z.object({
        children: zodCategoryChildrenObject.merge(
          z.object({ children: zodCategoryChildrenObject }),
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
