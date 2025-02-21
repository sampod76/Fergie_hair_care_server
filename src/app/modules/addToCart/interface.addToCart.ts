import { Model, Types } from 'mongoose';
import { z } from 'zod';
import { I_STATUS } from '../../../global/enum_constant_type';
import { IUserRef } from '../allUser/typesAndConst';
import { AddToCartValidation } from './validation.addToCart';

export type IAddToCartFilters = {
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

export type IAddToCart = z.infer<
  typeof AddToCartValidation.createAddToCartBodyData
> &
  z.infer<typeof AddToCartValidation.updateAddToCartZodSchema> & {
    isDelete: boolean;
    author: IUserRef;
    oldRecord?: {
      refId: Types.ObjectId;
      collection?: string;
    };
  };

export type AddToCartModel = Model<IAddToCart, Record<string, unknown>>;
