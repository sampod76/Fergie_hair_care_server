import { z } from 'zod';
import { I_STATUS, STATUS_ARRAY } from '../../../global/enum_constant_type';
import { zodFileAfterUploadSchema } from '../../../global/schema/global.schema';
import { zodCategoryChildrenObject } from '../allUser/generalUser/validation.generalUser';
import { I_LogType, LOG_TYPE_ARRAY } from './constant.serviceLogger';
export const zodlogWashDay = z.object({
  productsUsed: z.string().max(2000).optional(),
  routineSteps: z.string().max(2000).optional(),
  hairHealth: z.string().max(2000).optional(),
  //
  Wash_Day_Mood: zodCategoryChildrenObject,
  Choice_of_Treatment: zodCategoryChildrenObject,
  Post_Wash_Day_Style: zodCategoryChildrenObject,
  Hair_Health: zodCategoryChildrenObject,
});
export const zodlogStyleArchive = z.object({
  What_Style_Did_You_Do: zodCategoryChildrenObject,
  Style_Rating: zodCategoryChildrenObject,
  Hair_Service_Quality: zodCategoryChildrenObject,
  Duration_of_style_wear: zodCategoryChildrenObject,
  Maintenance_Routine: zodCategoryChildrenObject,
});
export const zodlogTrimTracker = z.object({
  Haircut_Type: zodCategoryChildrenObject,
  Length_Cut: zodCategoryChildrenObject,
  Hair_Health: zodCategoryChildrenObject,
  //
  currentHairLengthDetails: z.string().max(2000).optional(),
});
//************************************** */
const createServiceLogger_BodyData = z
  .object({
    logType: z.enum(LOG_TYPE_ARRAY as [I_LogType]),
    logDate: z.date().or(z.string().datetime()),
    images: z.array(zodFileAfterUploadSchema),
    status: z.enum(STATUS_ARRAY as [I_STATUS, ...I_STATUS[]]).optional(),
    serialNumber: z.number().optional(),
    categories: z.array(
      zodCategoryChildrenObject
        .merge(z.object({ children: zodCategoryChildrenObject }))
        .deepPartial(),
    ),

    // category: z
    //   .object({})
    //   .merge(zodlogWashDay.partial())
    //   .merge(zodlogStyleArchive.partial())
    //   .merge(zodlogTrimTracker.partial()),
  })
  .merge(
    zodlogWashDay.pick({
      productsUsed: true,
      routineSteps: true,
      hairHealth: true,
    }),
  )
  .merge(zodlogTrimTracker.pick({ currentHairLengthDetails: true }));

//**************************************** */
const updateServiceLogger_BodyData = z.object({
  isDelete: z.boolean().optional(),
});
const createServiceLoggerZodSchema = z.object({
  body: createServiceLogger_BodyData,
});

const updateServiceLoggerZodSchema = z.object({
  body: createServiceLogger_BodyData
    .merge(updateServiceLogger_BodyData)
    .deepPartial(),
});

export const ServiceLoggerValidation = {
  createServiceLoggerZodSchema,
  updateServiceLoggerZodSchema,
  //
  createServiceLogger_BodyData,
  updateServiceLogger_BodyData,
};
