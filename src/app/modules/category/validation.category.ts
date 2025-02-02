import { z } from 'zod';
import { I_STATUS, STATUS_ARRAY } from '../../../global/enum_constant_type';
import { zodFileAfterUploadSchema } from '../../../global/schema/global.schema';
import { I_ROLE_TYPE } from '../allUser/user/user.interface';
import { ROLE_TYPE_ARRAY } from '../allUser/user/zod/generalUser.zod';
const createCategoryBodyData = z.object({
  title: z.string({
    required_error: 'Title is required',
  }),
  subTitle: z.string().optional(),
  company: z.enum(ROLE_TYPE_ARRAY as [I_ROLE_TYPE], {
    required_error: 'Company is required',
  }),
  image: zodFileAfterUploadSchema
    .or(z.array(zodFileAfterUploadSchema))
    .optional(),
  files: z.array(zodFileAfterUploadSchema),
  status: z.enum(STATUS_ARRAY as [I_STATUS, ...I_STATUS[]]).optional(),
  serialNumber: z.number().optional(),
});
const createCategoryZodSchema = z.object({
  body: createCategoryBodyData,
});

const updateCategoryZodSchema = createCategoryZodSchema
  .merge(
    z.object({
      isDelete: z.boolean().optional(),
    }),
  )
  .deepPartial();

export const CategoryValidation = {
  createCategoryZodSchema,
  updateCategoryZodSchema,
  //
  createCategoryBodyData,
};
