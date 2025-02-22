
      import { Model } from 'mongoose';
import { z } from 'zod';
import { I_STATUS, I_YN } from '../../../global/enum_constant_type';
import { IUserRef } from '../allUser/typesAndConst';
import { TipsAndGuidelineValidation } from './validation.TipsAndGuideline';

export type ITipsAndGuidelineFilters = {
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

export type ITipsAndGuideline = z.infer<
  typeof TipsAndGuidelineValidation.createTipsAndGuideline_BodyData
> &
  z.infer<typeof TipsAndGuidelineValidation.updateTipsAndGuideline_BodyData> & {
    isDelete: boolean;
    author: IUserRef;
  };

export type TipsAndGuidelineModel = Model<
  ITipsAndGuideline,
  Record<string, unknown>
>;

      
