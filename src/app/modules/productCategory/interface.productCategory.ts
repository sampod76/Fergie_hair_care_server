import { Model, Types } from 'mongoose';
import { z } from 'zod';
import { I_STATUS, I_YN } from '../../../global/enum_constant_type';
import { I_ROLE_TYPE } from '../allUser/user/user.interface';
import { ProductCategoryValidation } from './validation.productCategory';

export type IProductCategoryFilters = {
  searchTerm?: string;
  title?: string;
  status?: I_STATUS;
  company?: I_ROLE_TYPE;
  serialNumber?: number;
  delete?: I_YN;
  children?: string;
  isDelete?: string | boolean;
  'author.userId': string;
  //
  createdAtFrom?: string;
  createdAtTo?: string;
  needProperty?: string;
};

export type IProductCategory = z.infer<
  typeof ProductCategoryValidation.createProductCategoryBodyData
> &
  z.infer<typeof ProductCategoryValidation.updateProductCategoryZodSchema> & {
    isDelete: boolean;
    oldRecord?: {
      refId: Types.ObjectId;
      collection?: string;
    };
  };

export type ProductCategoryModel = Model<
  IProductCategory,
  Record<string, unknown>
>;
