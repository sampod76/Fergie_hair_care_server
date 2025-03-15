import { z } from 'zod';
import { I_STATUS, STATUS_ARRAY } from '../../../../global/enum_constant_type';
import { zodFileAfterUploadSchema } from '../../../../global/schema/global.schema';
import { Types } from 'mongoose';

const createUserSaveProductBodyData = z.object({
  name: z.string({
    required_error: 'Title is required',
  }),
  subTitle: z.string().optional(),
  images: z.array(zodFileAfterUploadSchema).optional(),
  productCategoryId: z.union([
    z.string({ required_error: 'Product Category is required' }),
    z.instanceof(Types.ObjectId), // Assuming IProductCategory is an array of strings
  ]),
  description: z.string().optional(),
  status: z.enum(STATUS_ARRAY as [I_STATUS, ...I_STATUS[]]).optional(),
  serialNumber: z.number().optional(),
});
const createUserSaveProductZodSchema = z.object({
  body: createUserSaveProductBodyData,
});

const updateUserSaveProductZodSchema = z.object({
  body: createUserSaveProductZodSchema
    .merge(
      z.object({
        isDelete: z.boolean().optional(),
      }),
    )
    .deepPartial(),
});

export const UserSaveProductValidation = {
  createUserSaveProductZodSchema,
  updateUserSaveProductZodSchema,
  //
  createUserSaveProductBodyData,
};
