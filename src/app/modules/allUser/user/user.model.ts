/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-this-alias */
import bcrypt from 'bcrypt';
import { model, PipelineStage, Schema, Types } from 'mongoose';
import config from '../../../../config';

import {
  ENUM_SOCKET_STATUS,
  ENUM_STATUS,
  SOCKET_STATUS_ARRAY,
  STATUS_ARRAY,
} from '../../../../global/enum_constant_type';
import { ENUM_USER_ROLE } from '../../../../global/enums/users';
import { mongooseLocationSchema } from '../../../../global/schema/global.schema';
import ApiError from '../../../errors/ApiError';
import { Admin } from '../admin/admin.model';

import { LookupAnyRoleDetailsReusable } from '../../../../helper/lookUpResuable';

import { ENUM_REDIS_KEY } from '../../../redis/consent.redis';
import { redisClient } from '../../../redis/redis';

import { GeneralUser } from '../generalUser/model.generalUser';
import { ENUM_VERIFY, VERIFY_ARRAY } from '../typesAndConst';
import {
  ENUM_ACCOUNT_TYPE,
  I_AccountTypeArray,
  IUser,
  USER_ROLE_ARRAY,
  UserModel,
} from './user.interface';

const userSchema = new Schema<IUser, UserModel>(
  {
    userUniqueId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      // required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      // unique: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: USER_ROLE_ARRAY,
      default: ENUM_USER_ROLE.generalUser,
    },
    accountType: {
      type: String,
      enum: I_AccountTypeArray,
      default: ENUM_ACCOUNT_TYPE.custom,
    },
    password: {
      type: String,
      required: true,
      select: 0,
    },
    //
    //
    authentication: {
      otp: Number,
      timeOut: Date,
      jwtToken: String,
      status: {
        type: String,
        enum: STATUS_ARRAY,
        // default: ENUM_STATUS.ACTIVE,
      },
    },
    lastActive: {
      createdAt: Date,
    },
    secret: {
      // 2FA
      type: String,
      select: 0,
    },
    socketStatus: {
      type: String,
      enum: SOCKET_STATUS_ARRAY,
      default: ENUM_SOCKET_STATUS.OFFLINE,
    },
    location: mongooseLocationSchema,
    status: {
      type: String,
      enum: STATUS_ARRAY,
      default: ENUM_STATUS.ACTIVE,
    },
    verify: {
      type: String,
      enum: VERIFY_ARRAY,
      default: function () {
        return this.role === ENUM_USER_ROLE.admin
          ? ENUM_VERIFY.PENDING
          : ENUM_VERIFY.ACCEPT;
      },
    },
    isDelete: {
      type: Boolean,

      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

userSchema.statics.isUserFindMethod = async function (
  query: { id?: string; email?: string; company?: string },
  option?: {
    isDelete?: boolean;
    populate?: boolean;
    password?: boolean;
    needProperty?: string[];
  },
): Promise<IUser | null> {
  let user;
  const match: any = {};
  if (query.id) {
    match._id = new Types.ObjectId(query.id);
  } else if (query.email) {
    match.email = query.email;
  }

  //
  if (option?.isDelete) {
    match.isDelete = option.isDelete;
  } else {
    match.isDelete = false;
  }
  const project: any = { __v: 0, password: 0, secret: 0 };
  if (option?.password) {
    delete project.password;
  }

  //general perpose
  if (!option?.populate) {
    const result = await User.aggregate([
      {
        $match: match,
      },
      {
        $project: project,
      },
    ]);
    user = result[0];
  } else {
    const pipeline: PipelineStage[] = [
      {
        $match: match,
      },
      {
        $project: project,
      },
    ];
    LookupAnyRoleDetailsReusable(pipeline, {
      collections: [
        {
          roleMatchFiledName: 'role',
          idFiledName: '$_id',
          pipeLineMatchField: '$userId',
          outPutFieldName: 'roleInfo',
        },
      ],
    });

    //!---Any role add then this role Must be add allGetUsers in --
    const result = (await User.aggregate(pipeline)) as IUser[];

    user = result[0];
  }
  return user;
};
userSchema.statics.isPasswordMatchMethod = async function (
  givenPassword: string,
  savedPassword: string,
): Promise<boolean | null> {
  return await bcrypt.compare(givenPassword, savedPassword);
};
// before save then data then call this hook
userSchema.pre('save', async function (next) {
  try {
    const user = this;
    /*
     const UserModel = this.constructor as UserModel; // Explicit cast
    !--- another application in work this condition--but when same email to create multiple types account then not work this
    const existingUser = await UserModel.findOne({ email: user.email });
     if (existingUser?.email) {
     throw new ApiError(400, 'Email is already available');
    }
      */
    let roleUser;
    if (user.role === ENUM_USER_ROLE.generalUser) {
      roleUser = await GeneralUser.findOne({ email: user.email });
    } else if (user.role === ENUM_USER_ROLE.admin) {
      roleUser = await Admin.findOne({ email: user.email });
    }

    if (roleUser) {
      throw new ApiError(400, 'Email is already available');
    }

    if (user.isModified('password')) {
      user.password = await bcrypt.hash(
        user.password,
        Number(config.bycrypt_salt_rounds),
      );
    }
    next();
  } catch (error: any) {
    next(error);
  }
});

// after then save data then call this hook
userSchema.post('save', async function (data, next) {
  try {
    data.password = '';

    await redisClient.set(
      ENUM_REDIS_KEY.REDIS_IN_SAVE_ALL_USERS + data?._id,
      JSON.stringify(data),
      'EX',
      24 * 60 * 60, // 1 day to second
    );
    next();
  } catch (error: any) {
    next(error);
  }
});
// after then save data then call this hook
userSchema.post('findOneAndUpdate', async function (data, next) {
  try {
    data.password = '';
    const updatedFields = this.getUpdate();
    // let roleUser;
    // //@ts-ignore
    // if (updatedFields && updatedFields?.$set?.verify) {
    //   if (data.role === ENUM_USER_ROLE.BUYER) {
    //     roleUser = await BuyerUser.findOne({ email: data.email });
    //   } else if (data.role === ENUM_USER_ROLE.generalUser) {
    //     roleUser = await GeneralUser.findOne({ email: data.email });
    //   } else if (data.role === ENUM_USER_ROLE.admin) {
    //     roleUser = await Admin.findOne({ email: data.email });
    //   }
    // }
    await redisClient.set(
      ENUM_REDIS_KEY.REDIS_IN_SAVE_ALL_USERS + data?._id,
      JSON.stringify(data),
      'EX',
      24 * 60 * 60, // 1 day to second
    );
    next();
  } catch (error: any) {
    next(error);
  }
});
// after then save data then call this hook
userSchema.post('findOneAndDelete', async function (data, next) {
  try {
    // data.password = '';
    await redisClient.del(ENUM_REDIS_KEY.REDIS_IN_SAVE_ALL_USERS + data?._id);
    next();
  } catch (error: any) {
    next(error);
  }
});

export const User = model<IUser, UserModel>('User', userSchema);
//@ts-ignore
const tempUserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      index: true,
      lowercase: true,
    },
    role: {
      type: String,
      required: true,
      enum: USER_ROLE_ARRAY,
      default: ENUM_USER_ROLE.generalUser,
    },

    isEmailVerify: {
      type: String,

      default: false,
    },
    authentication: {
      type: {
        otp: Number,
        jwtToken: String,
        timeOut: Date,
        status: {
          type: String,
          enum: STATUS_ARRAY,
          default: ENUM_STATUS.ACTIVE,
        },
      },
    },
    status: {
      type: String,
      enum: STATUS_ARRAY,
      default: ENUM_STATUS.ACTIVE,
    },
    isDelete: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

export const TempUser = model<IUser, UserModel>('TempUser', tempUserSchema);
