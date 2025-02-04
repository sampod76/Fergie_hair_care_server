import { Model, Types } from 'mongoose';
import { z } from 'zod';
import { I_STATUS, I_YN } from '../../../global/enum_constant_type';
import { I_ROLE_TYPE } from '../allUser/user/user.interface';
import { CategoryValidation } from './validation.category';

export type ICategoryFilters = {
  searchTerm?: string;
  title?: string;
  status?: I_STATUS;
  company?: I_ROLE_TYPE;
  serialNumber?: number;
  delete?: I_YN;
  children?: string;
  cache?: string;
  isDelete?: string | boolean;
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
