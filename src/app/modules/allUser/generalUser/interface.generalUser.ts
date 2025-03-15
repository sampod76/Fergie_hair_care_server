import { Model, Types } from 'mongoose';

import { z } from 'zod';
import { I_STATUS } from '../../../../global/enum_constant_type';
import { ICommonUser } from '../typesAndConst';
import { I_ROLE_TYPE, IACCOUNT_TYPE } from '../user/user.interface';
import { UserValidation } from '../user/user.validation';
import { GeneralUserValidation } from './validation.generalUser';

export type IGeneralUserFilters = {
  searchTerm?: string;
  userUniqueId?: string;
  authUserId?: string | Types.ObjectId;
  gender?: string;
  countryName?: string;
  skills?: string;
  dateOfBirth?: string;
  delete?: string;
  status?: I_STATUS;
  isDelete?: string | boolean;
  company?: I_ROLE_TYPE;
  createdAtFrom?: string;
  createdAtTo?: string;
  needProperty?: string;
  accountType?: string;
  verify?: string;
};

export type IGeneralUser = ICommonUser &
  z.infer<typeof UserValidation.generalUserZod_BodyData> &
  z.infer<typeof GeneralUserValidation.otherBodyData> & {
    authUserId: string | Types.ObjectId;
    userId: string | Types.ObjectId;
    accountType: IACCOUNT_TYPE;
  };
export type GeneralUserModel = {
  isGeneralUserExistMethod(
    id: string,
    option: Partial<{
      isDelete: boolean;
      populate: boolean;
      needProperty?: string[];
    }>,
  ): Promise<IGeneralUser>;
} & Model<IGeneralUser>;
