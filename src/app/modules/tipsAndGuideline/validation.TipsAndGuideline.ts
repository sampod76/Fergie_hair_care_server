import { z } from 'zod';
import { I_STATUS, STATUS_ARRAY } from '../../../global/enum_constant_type';
import { zodFileAfterUploadSchema } from '../../../global/schema/global.schema';
import { zodCategoryChildrenObject } from '../allUser/generalUser/validation.generalUser';

const createTipsAndGuideline_BodyData = z.object({
  title: z.string({ required_error: 'Title is required' }).max(500),
  details: z.string({ required_error: 'Details is required' }),
  tips: z
    .object({
      do: z.array(z.object({ title: z.string() })),
      doNot: z.array(z.object({ title: z.string() })),
    })
    .partial(),
  category: z.array(
    zodCategoryChildrenObject.merge(
      z.object({
        children: zodCategoryChildrenObject
          .merge(z.object({ children: zodCategoryChildrenObject.optional() }))
          .optional(),
      }),
    ),
  ),
  images: z.array(zodFileAfterUploadSchema).optional(),
  status: z.enum(STATUS_ARRAY as [I_STATUS, ...I_STATUS[]]).optional(),
  serialNumber: z.number().optional(),
});
const updateTipsAndGuideline_BodyData = z.object({
  isDelete: z.boolean().optional(),
});
const createTipsAndGuidelineZodSchema = z.object({
  body: createTipsAndGuideline_BodyData,
});

const updateTipsAndGuidelineZodSchema = z.object({
  body: createTipsAndGuideline_BodyData
    .merge(updateTipsAndGuideline_BodyData)
    .deepPartial(),
});

export const TipsAndGuidelineValidation = {
  createTipsAndGuidelineZodSchema,
  updateTipsAndGuidelineZodSchema,
  //
  createTipsAndGuideline_BodyData,
  updateTipsAndGuideline_BodyData,
};
