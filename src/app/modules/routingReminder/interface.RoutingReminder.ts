import { Model } from 'mongoose';
import { z } from 'zod';
import { I_STATUS } from '../../../global/enum_constant_type';
import { IUserRef } from '../allUser/typesAndConst';
import { RoutingReminderValidation } from './validation.RoutingReminder';

export type IRoutingReminderFilters = {
  searchTerm?: string;
  reminderType?: string; // Added reminderType
  status?: I_STATUS;
  delete?: string;
  serialNumber?: number;
  isDelete?: string | boolean;
  month?: string; // Added month
  scheduleType?: string; // Added scheduleType
  pickDateFrom?: string; // Added pickDateFrom
  pickDateTo?: string; // Added pickDateTo
  startTime?: string; // Added startTime
  endTime?: string; // Added endTime
  needProperty?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  'author.userId'?: string;
  'author.roleBaseUserId'?: string;
  children?: string; // Added children
  cache?: string; // Added cache
  productId?: string; // Added productId
};

export type IRoutingReminder = z.infer<
  typeof RoutingReminderValidation.createRoutingReminder_BodyData
> &
  z.infer<typeof RoutingReminderValidation.updateRoutingReminder_BodyData> & {
    isDelete: boolean;
    author: IUserRef;
    cornJob: {
      jobId: string;
      isActive: boolean;
    };
  };

export type RoutingReminderModel = Model<
  IRoutingReminder,
  Record<string, unknown>
>;
