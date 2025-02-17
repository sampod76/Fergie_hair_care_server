import { Model, Types } from 'mongoose';
import { z } from 'zod';
import { I_STATUS, I_YN } from '../../../global/enum_constant_type';
import { IUserRef } from '../allUser/typesAndConst';
import { FavoriteProductValidation } from './validation.favoriteProduct';

export type IFavoriteProductFilters = {
  searchTerm?: string;
  status?: I_STATUS;
  serialNumber?: number;
  delete?: I_YN;
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

export type IFavoriteProduct = z.infer<
  typeof FavoriteProductValidation.createFavoriteProductBodyData
> &
  z.infer<typeof FavoriteProductValidation.updateFavoriteProductZodSchema> & {
    isDelete: boolean;
    author: IUserRef;
    oldRecord?: {
      refId: Types.ObjectId;
      collection?: string;
    };
  };

export type FavoriteProductModel = Model<
  IFavoriteProduct,
  Record<string, unknown>
>;
