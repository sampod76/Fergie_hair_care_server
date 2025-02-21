import { Model } from 'mongoose';
import { z } from 'zod';
import { I_STATUS } from '../../../global/enum_constant_type';
import { IUserRef } from '../allUser/typesAndConst';
import { ServiceLoggerValidation } from './validation.serviceLogger';

export type IServiceLoggerFilters = {
  searchTerm?: string;
  status?: I_STATUS;
  serialNumber?: number;

  children?: string;
  cache?: string;
  isDelete?: string | boolean;

  'author.userId'?: string;
  'author.roleBaseUserId'?: string;
  //-----category------
  Wash_Day_Mood?: string;
  Choice_of_Treatment?: string;
  Post_Wash_Day_Style?: string;
  Hair_Health?: string;
  What_Style_Did_You_Do?: string;
  Style_Rating?: string;
  Hair_Service_Quality?: string;
  Duration_of_style_wear?: string;
  Maintenance_Routine?: string;
  Haircut_Type?: string;
  Length_Cut?: string;
  //------------------
  logDateFrom?: string;
  logDateTo?: string;
  //
  createdAtFrom?: string;
  createdAtTo?: string;
  needProperty?: string;
};

export type IServiceLogger = z.infer<
  typeof ServiceLoggerValidation.createServiceLogger_BodyData
> &
  z.infer<typeof ServiceLoggerValidation.updateServiceLogger_BodyData> & {
    isDelete: boolean;
    author: IUserRef;
  };

export type ServiceLoggerModel = Model<IServiceLogger, Record<string, unknown>>;
