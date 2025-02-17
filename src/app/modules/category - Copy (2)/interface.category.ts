import { Model, Types } from 'mongoose';
import { z } from 'zod';
import { I_STATUS, I_YN } from '../../../global/enum_constant_type';
import { I_ROLE_TYPE } from '../allUser/user/user.interface';
import { CategoryValidation } from './validation.category';
//
export enum ENUM_CATEGORY_TYPE {
  profile = 'profile',
  logWashDay = 'logWashDay',
  logStyleArchive = 'logStyleArchive',
  logTrimTracker = 'logTrimTracker',
}
export type I_CategoryType = keyof typeof ENUM_CATEGORY_TYPE;
export const CATEGORY_TYPE_ARRAY = Object.values(ENUM_CATEGORY_TYPE);
//
export type ICategoryFilters = {
  searchTerm?: string;
  label?: string;
  categoryType?: string;
  uid?: string;
  status?: I_STATUS;
  company?: I_ROLE_TYPE;
  serialNumber?: number;
  delete?: I_YN;
  children?: string;
  cache?: string;
  isDelete?: string | boolean;
  authorUserId?: string;
  //
  createdAtFrom?: string;
  createdAtTo?: string;
  needProperty?: string;
  //
};

export type ICategory = z.infer<
  typeof CategoryValidation.createCategoryBodyData
> &
  z.infer<typeof CategoryValidation.updateCategoryZodSchema> & {
    isDelete: boolean;
    oldRecord?: {
      refId: Types.ObjectId;
      collection?: string;
    };
  };

export type CategoryModel = Model<ICategory, Record<string, unknown>>;
