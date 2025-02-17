import { Model } from 'mongoose';
import { z } from 'zod';

import { IUserRef } from '../../allUser/typesAndConst';

import { I_STATUS, I_YN } from '../../../../global/enum_constant_type';
import { ProductValidation } from './validation.products';

export type IProductFilters = {
  searchTerm?: string;

  status?: I_STATUS;

  serialNumber?: number;
  delete?: I_YN;
  children?: string;
  isDelete?: string | boolean;
  productCategoryId?: string;
  //
  maxPrice?: string;
  minPrice?: string;
  //
  createdAtFrom?: string;
  createdAtTo?: string;
  needProperty?: string;
  //
  'author.userId'?: string;
  'author.roleBaseUserId'?: string;
};

export type IProduct = z.infer<typeof ProductValidation.createProductBodyData> &
  z.infer<typeof ProductValidation.updateProductZodSchema> & {
    isDelete: boolean;
    author: IUserRef;
  };

export type ProductModel = Model<IProduct, Record<string, unknown>>;
