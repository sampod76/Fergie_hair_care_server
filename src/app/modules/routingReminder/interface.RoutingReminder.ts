import { Model } from 'mongoose';
import { z } from 'zod';
import { I_STATUS } from '../../../global/enum_constant_type';
import { IUserRef } from '../allUser/typesAndConst';
import { RoutingReminderValidation } from './validation.RoutingReminder';

export type IRoutingReminderFilters = {
  searchTerm?: string;
  status?: I_STATUS;
  serialNumber?: number;
  delete?: string;
  children?: string;
  cache?: string;
  isDelete?: string | boolean;
  productId?: string;
  'author.userId'?: string;
  'author.roleBaseUserId'?: string;
  //
  createdAtFrom?: string;
  createdAtTo?: string;
  needProperty?: string;
  //
};

export type IRoutingReminder = z.infer<
  typeof RoutingReminderValidation.createRoutingReminder_BodyData
> &
  z.infer<typeof RoutingReminderValidation.updateRoutingReminder_BodyData> & {
    isDelete: boolean;
    author: IUserRef;
  };

export type RoutingReminderModel = Model<
  IRoutingReminder,
  Record<string, unknown>
>;
