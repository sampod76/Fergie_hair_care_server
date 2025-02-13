import { z } from 'zod';
import { I_STATUS, STATUS_ARRAY } from '../../../global/enum_constant_type';
import { zodFileAfterUploadSchema } from '../../../global/schema/global.schema';

const createCategoryBodyData = z.object({
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
  children: z.array(
    z
      .object({
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
        serialNumber: z.number().optional(),
        children: z
          .array(
            z
              .object({
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
                serialNumber: z.number().optional(),
              })
              .optional(),
          )
          .optional(),
      })
      .optional(),
  ),
  image: zodFileAfterUploadSchema
    .or(z.array(zodFileAfterUploadSchema))
    .optional(),

  status: z.enum(STATUS_ARRAY as [I_STATUS, ...I_STATUS[]]).optional(),
  serialNumber: z.number().optional(),
});
const createCategoryZodSchema = z.object({
  body: createCategoryBodyData,
});

const updateCategoryZodSchema = z.object({
  body: createCategoryBodyData
    .merge(
      z.object({
        isDelete: z.boolean().optional(),
      }),
    )
    .deepPartial(),
});

export const CategoryValidation = {
  createCategoryZodSchema,
  updateCategoryZodSchema,
  //
  createCategoryBodyData,
};
