import { z } from 'zod';
import { I_STATUS, STATUS_ARRAY } from '../../../global/enum_constant_type';
import { zodFileAfterUploadSchema } from '../../../global/schema/global.schema';
const createProductCategoryBodyData = z.object({
  title: z.string({
    required_error: 'Title is required',
  }),
  subTitle: z.string().optional(),
  image: zodFileAfterUploadSchema
    .or(z.array(zodFileAfterUploadSchema))
    .optional(),
  files: z.array(zodFileAfterUploadSchema),
  status: z.enum(STATUS_ARRAY as [I_STATUS, ...I_STATUS[]]).optional(),
  serialNumber: z.number().optional(),
});
const createProductCategoryZodSchema = z.object({
  body: createProductCategoryBodyData,
});

const updateProductCategoryZodSchema = createProductCategoryZodSchema
  .merge(
    z.object({
      isDelete: z.boolean().optional(),
    }),
  )
  .deepPartial();

export const ProductCategoryValidation = {
  createProductCategoryZodSchema,
  updateProductCategoryZodSchema,
  //
  createProductCategoryBodyData,
};
