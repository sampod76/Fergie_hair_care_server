import { Model } from 'mongoose';
import { z } from 'zod';
import { I_STATUS } from '../../../global/enum_constant_type';
import { IUserRef } from '../allUser/typesAndConst';
import { FavoriteProductValidation } from './validation.favoriteProduct';

export type IFavoriteProductFilters = {
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

export type IFavoriteProduct = z.infer<
  typeof FavoriteProductValidation.createFavoriteProduct_BodyData
> &
  z.infer<typeof FavoriteProductValidation.updateFavoriteProduct_BodyData> & {
    isDelete: boolean;
    author: IUserRef;
  };

export type FavoriteProductModel = Model<
  IFavoriteProduct,
  Record<string, unknown>
>;
