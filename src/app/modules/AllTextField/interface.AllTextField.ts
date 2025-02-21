import { Model, Types } from 'mongoose';

import { I_STATUS } from '../../../global/enum_constant_type';
import { IFileAfterUpload } from '../../interface/fileUpload';
export const DATA_TYPE_ARRAY = [
  'aboutUs',
  'termsAndPolice',
  'contactUs',
  'support',
  'privacyPolicy',
  'howToWork',
  'howToRent',
  'adminInfo',
];

export type IDataType =
  | 'aboutUs'
  | 'termsAndPolice'
  | 'privacyPolicy'
  | 'contactUs'
  | 'support'
  | 'howToWork'
  | 'howToRent'
  | 'adminInfo';
export type IAllTextFieldFilters = {
  searchTerm?: string;
  heading?: string;
  dataType?: IDataType;
  status?: I_STATUS;
  delete?: string;
  isDelete?: boolean | string;
};

export type IAllTextField = {
  htmlText: string;
  heading?: string;
  image?: IFileAfterUpload;
  dataType: IDataType;
  bodyData: Record<string, string>;
  //
  status: I_STATUS;
  isDelete: boolean;
  //--- for --Trash---
  oldRecord?: {
    refId: Types.ObjectId;
    collection?: string;
  };
};

export type AllTextFieldModel = Model<IAllTextField, Record<string, unknown>>;
