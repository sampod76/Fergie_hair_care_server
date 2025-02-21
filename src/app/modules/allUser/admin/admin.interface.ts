import { Model, Types } from 'mongoose';

import { I_STATUS } from '../../../../global/enum_constant_type';
import { ICommonUser } from '../typesAndConst';
import { I_USER_ROLE } from '../user/user.interface';

export type IAdminFilters = {
  searchTerm?: string;
  delete?: string;
  role?: I_USER_ROLE;
  multipleRole?: I_USER_ROLE[];
  status?: I_STATUS;
  isDelete?: string | boolean;
  author?: string;
};

export type IAdmin = ICommonUser & {
  authUserId: string | Types.ObjectId;
  userId: string | Types.ObjectId;
};
export type AdminModel = {
  isAdminExistMethod(
    email: string,
  ): Promise<Pick<IAdmin, 'email' | 'status' | 'userUniqueId' | '_id'>>;
} & Model<IAdmin>;
