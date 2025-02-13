import { Model } from 'mongoose';
import { z } from 'zod';

import { IUserRef } from '../../allUser/typesAndConst';

import { I_STATUS, I_YN } from '../../../../global/enum_constant_type';
import { UserSaveProductValidation } from './validation.products';

export type IUserSaveProductFilters = {
  searchTerm?: string;

  status?: I_STATUS;

  serialNumber?: number;
  delete?: I_YN;
  children?: string;
  isDelete?: string | boolean;
  productCategoryId?: string;
  //
  createdAtFrom?: string;
  createdAtTo?: string;
  needProperty?: string;
  //
  'author.userId'?: string;
  'author.roleBaseUserId'?: string;
};

export type IUserSaveProduct = z.infer<
  typeof UserSaveProductValidation.createUserSaveProductBodyData
> &
  z.infer<typeof UserSaveProductValidation.updateUserSaveProductZodSchema> & {
    isDelete: boolean;
    author: IUserRef;
  };

export type UserSaveProductModel = Model<
  IUserSaveProduct,
  Record<string, unknown>
>;
