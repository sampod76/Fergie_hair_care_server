import { Model, Types } from 'mongoose';

import { z } from 'zod';
import { I_STATUS, I_YN } from '../../../../global/enum_constant_type';
import { ICommonUser } from '../typesAndConst';
import { I_ROLE_TYPE } from '../user/user.interface';
import { UserValidation } from '../user/user.validation';

export type IGeneralUserFilters = {
  searchTerm?: string;
  userUniqueId?: string;
  authUserId?: string | Types.ObjectId;
  gender?: string;
  countryName?: string;
  skills?: string;
  dateOfBirth?: string;
  delete?: I_YN;
  status?: I_STATUS;
  isDelete?: string | boolean;
  company?: I_ROLE_TYPE;
  createdAtFrom?: string;
  createdAtTo?: string;
  needProperty?: string;
  verify?: string;
};

export type IGeneralUser = ICommonUser &
  z.infer<typeof UserValidation.generalUserZod_BodyData> & {
    authUserId: string | Types.ObjectId;
    userId: string | Types.ObjectId;
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
