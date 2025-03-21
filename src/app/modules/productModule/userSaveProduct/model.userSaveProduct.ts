import { Schema, model } from 'mongoose';

import { RedisAllSetterServiceOop } from '../../../redis/service.redis';
import { mongooseIUserRef } from '../../allUser/typesAndConst';

import {
  ENUM_STATUS,
  STATUS_ARRAY,
} from '../../../../global/enum_constant_type';
import { mongooseFileSchema } from '../../../../global/schema/global.schema';
import { ENUM_REDIS_KEY } from '../../../redis/consent.redis';
import {
  IUserSaveProduct,
  UserSaveProductModel,
} from './interface.userSaveProduct';
const UserSaveProductSchema = new Schema<
  IUserSaveProduct,
  UserSaveProductModel
>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subTitle: {
      type: String,
    },

    images: [mongooseFileSchema],
    author: mongooseIUserRef,
    description: {
      type: String,
    },
    productCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductCategory',
    },
    serialNumber: {
      type: Number,
      default: 0,
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
    // strict: 'throw',
    toJSON: {
      virtuals: true,
    },
  },
);

UserSaveProductSchema.post('findOneAndDelete', async function () {
  try {
    const dataId = this.getFilter();
    // console.log(dataId); // { _id: '6607a2b70d0b8a202a1b81b4' }
    const redisSetterOop = new RedisAllSetterServiceOop();
    await redisSetterOop
      .getGlobalRedis()
      .del(ENUM_REDIS_KEY.RIS_User_Save_Product + dataId._id.toString());
  } catch (error: any) {
    // console.log('🚀 ~ error:', error);
  }
});
// after findOneAndUpdate then data then call this hook
UserSaveProductSchema.post(
  'findOneAndUpdate',
  async function (data: IUserSaveProduct & { _id: string }, next: any) {
    try {
      const redisSetterOop = new RedisAllSetterServiceOop();
      await redisSetterOop
        .getGlobalRedis()
        .del(ENUM_REDIS_KEY.RIS_User_Save_Product + data._id.toString());
      // console.log('update');
      next();
    } catch (error: any) {
      next(error);
    }
  },
);
UserSaveProductSchema.post(
  'save',
  async function (data: any & { _id: string }, next: any) {
    try {
      const redisSetterOop = new RedisAllSetterServiceOop();
      await redisSetterOop.redisSetter([
        {
          value: data,
          key: ENUM_REDIS_KEY.RIS_User_Save_Product + data._id.toString(),
          ttl: 1 * 60 * 60,
        },
      ]);

      next();
    } catch (error: any) {
      next(error);
    }
  },
);

export const UserSaveProduct = model<IUserSaveProduct, UserSaveProductModel>(
  'UserSaveProduct',
  UserSaveProductSchema,
);
export const TrashUserSaveProduct = model<
  IUserSaveProduct,
  UserSaveProductModel
>('TrashUserSaveProduct', UserSaveProductSchema);
