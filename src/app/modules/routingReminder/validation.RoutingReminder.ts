import { z } from 'zod';
import { I_STATUS, STATUS_ARRAY } from '../../../global/enum_constant_type';
import { zodFileAfterUploadSchema } from '../../../global/schema/global.schema';
import {
  I_LogType,
  LOG_TYPE_ARRAY,
} from '../serviceLogger/constant.serviceLogger';
const timeStringSchema = z.string().refine(
  time => {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/; // 00-09 10-19 20-23
    return regex.test(time);
  },
  {
    message: 'Invalid time format , expected "HH:MM" in 24 hours format',
  },
);

const createRoutingReminder_BodyData = z.object({
  reminderType: z.enum(LOG_TYPE_ARRAY as [I_LogType]),
  scheduleType: z.enum(['date', 'week']),
  month: z.enum([
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]),
  pickDate: z
    .union([z.string(), z.string().datetime(), z.string().date()])
    .optional(),
  startTime: timeStringSchema, // HH: MM   00-23: 00-59
  endTime: timeStringSchema,
  productUseDetails: z.string().max(5000),
  applicationStepsDetails: z.string().max(5000),
  images: z.array(zodFileAfterUploadSchema).optional(),
  status: z.enum(STATUS_ARRAY as [I_STATUS, ...I_STATUS[]]).optional(),
  serialNumber: z.number().optional(),
});
const updateRoutingReminder_BodyData = z.object({
  isDelete: z.boolean().optional(),
});
const createRoutingReminderZodSchema = z
  .object({
    body: createRoutingReminder_BodyData,
  })
  .refine(
    ({ body }) => {
      // startTime : 10:30  => 1970-01-01T10:30
      //endTime : 12:30  =>  1970-01-01T12:30

      const start = new Date(`1970-01-01T${body.startTime}:00`);
      const end = new Date(`1970-01-01T${body.endTime}:00`);

      return end < start;
    },
    {
      message: 'Start time should be before End time !  ',
    },
  );

const updateRoutingReminderZodSchema = z.object({
  body: createRoutingReminder_BodyData
    .merge(updateRoutingReminder_BodyData)
    .deepPartial(),
});

export const RoutingReminderValidation = {
  createRoutingReminderZodSchema,
  updateRoutingReminderZodSchema,
  //
  createRoutingReminder_BodyData,
  updateRoutingReminder_BodyData,
};
