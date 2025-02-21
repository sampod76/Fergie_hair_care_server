import { Model, Types } from 'mongoose';
import {
  I_SOCKET_STATUS,
  I_STATUS,
  I_YN,
} from '../../../../global/enum_constant_type';
import { ENUM_USER_ROLE } from '../../../../global/enums/users';
import { I_VERIFY, ILocation } from '../typesAndConst';
import { ENUM_COMPANY_TYPE } from './user.constant';

export type IGender = 'male' | 'female' | 'other';
//
export const USER_ROLE_ARRAY = Object.values(ENUM_USER_ROLE);
export type I_USER_ROLE = keyof typeof ENUM_USER_ROLE;
//
export type I_ROLE_TYPE = keyof typeof ENUM_COMPANY_TYPE;
//
//
export enum ENUM_ACCOUNT_TYPE {
  custom = 'custom',
  google = 'google',
  apple = 'apple',
}
export type IACCOUNT_TYPE = keyof typeof ENUM_ACCOUNT_TYPE;
export const I_AccountTypeArray = Object.values(ENUM_ACCOUNT_TYPE);
//
export type IUserFilters = {
  searchTerm?: string;
  delete?: string;
  role?: I_USER_ROLE;
  company?: I_ROLE_TYPE;
  multipleRole?: I_USER_ROLE[];
  status?: I_STATUS;
  isDelete?: string | boolean;
  authUserId?: string;
  needProperty?: string;
  verify?: string;
  socketStatus?: I_YN;
  //
  latitude?: string;
  longitude?: string;
  maxDistance?: string;
  //
  createdAtFrom?: string;
  createdAtTo?: string;
};
type TempUserBody = {
  tempUser: {
    tempUserId: string;
    otp: string;
  };
};
export type IUser = {
  _id: string;
  userUniqueId: string;
  userName?: string;
  //--user give
  email: string;
  role: I_USER_ROLE;
  password: string;
  company: I_ROLE_TYPE;
  authUserId: string | Types.ObjectId;
  authentication?: {
    otp: number;
    jwtToken?: string;
    timeOut: string;
    status: I_STATUS;
  };
  accountType?: string;
  secret: string;
  location?: ILocation;
  status: I_STATUS;
  lastActive?: {
    createdAt: Date;
  };
  verify: I_VERIFY;
  socketStatus: I_SOCKET_STATUS;
  isDelete: boolean;
} & TempUserBody;

export type ITempUser = {
  email: string;
  role: I_USER_ROLE;
};
export type UserModel = {
  isUserFindMethod(
    query: { id?: string; email?: string; company?: string },
    option: {
      isDelete?: boolean;
      populate?: boolean;
      password?: boolean;
      needProperty?: string[];
    },
  ): Promise<IUser>;
  isPasswordMatchMethod(
    oldPassword: string,
    newPassword: string,
  ): Promise<boolean | null>;
} & Model<IUser>;
