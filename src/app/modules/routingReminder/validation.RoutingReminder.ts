import httpStatus from 'http-status';
import { z } from 'zod';
import { I_STATUS, STATUS_ARRAY } from '../../../global/enum_constant_type';
import {
  ENUM_DAYS_OF_WEEK,
  ENUM_MONTH,
  I_DayOfWeek,
  I_Month,
} from '../../../global/enums/globalEnums';
import { zodFileAfterUploadSchema } from '../../../global/schema/global.schema';
import ApiError from '../../errors/ApiError';
import {
  I_LogType,
  LOG_TYPE_ARRAY,
} from '../serviceLogger/constant.serviceLogger';
import {
  ENUM_SCHEDULE_TYPE_ROUTING,
  I_ScheduleType,
} from './constant.RoutingReminder';
const timeStringSchema = z.string().refine(
  time => {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/; // HH:MM or HH:MM:ss
    return regex.test(time);
  },
  {
    message:
      'Invalid time format, expected "HH:MM" or "HH:MM:ss" in 24-hour format',
  },
);

const createRoutingReminder_BodyData = z.object({
  reminderType: z.enum(LOG_TYPE_ARRAY as [I_LogType]),
  scheduleType: z.enum(
    Object.values(ENUM_SCHEDULE_TYPE_ROUTING) as [I_ScheduleType],
  ),
  month: z.enum(Object.values(ENUM_MONTH) as [I_Month]).optional(),
  daysOfWeek: z
    .array(z.enum(Object.values(ENUM_DAYS_OF_WEEK) as [I_DayOfWeek]))
    .optional(),
  pickDate: z
    .union([z.string(), z.string().datetime(), z.string().date()])
    .optional(),
  //
  cycleNumber: z.number().optional(),
  //
  startTime: z.string({ required_error: 'Start time is required' }), // HH: MM   00-23: 00-59
  endTime: z.string({ required_error: 'End time is required' }),
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
      const startTime = body.startTime;
      const endTime = body.endTime;
      if (startTime && endTime) {
        // Regex to match HH:MM or HH:MM:ss formats for both start and end times
        const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/;
        // Check if both times match the regex
        if (!regex.test(startTime) || !regex.test(endTime)) {
          return false;
        }
        // Append `:00` if seconds are not included in the time strings
        const start = new Date(
          `1970-01-01T${startTime.includes(':') && startTime.split(':').length === 2 ? startTime + ':00' : startTime}`,
        );
        const end = new Date(
          `1970-01-01T${endTime.includes(':') && endTime.split(':').length === 2 ? endTime + ':00' : endTime}`,
        );
        // Ensure start time is before end time
        return start < end;
      }
      if (body.scheduleType === 'date' && !body.pickDate) {
        throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Date must be required');
      }
      if (body.scheduleType === 'weekDay' && !body.daysOfWeek) {
        throw new ApiError(
          httpStatus.NOT_ACCEPTABLE,
          'daysOfWeek must be required',
        );
      }
      return true;
    },
    {
      message:
        'Start time should be before End time, and both should be in valid HH:MM or HH:MM:SS format!',
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
