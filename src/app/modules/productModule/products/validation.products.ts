import { Types } from 'mongoose';
import { z } from 'zod';
import { I_STATUS, STATUS_ARRAY } from '../../../../global/enum_constant_type';
import { zodFileAfterUploadSchema } from '../../../../global/schema/global.schema';

const createProductBodyData = z.object({
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
const createProductZodSchema = z.object({
  body: createProductBodyData,
});

const updateProductZodSchema = z.object({
  body: createProductZodSchema
    .merge(
      z.object({
        isDelete: z.boolean().optional(),
      }),
    )
    .deepPartial(),
});

export const ProductValidation = {
  createProductZodSchema,
  updateProductZodSchema,
  //
  createProductBodyData,
};
