import { Schema, model } from 'mongoose';

import { RedisAllSetterServiceOop } from '../../../redis/service.redis';
import { mongooseIUserRef } from '../../allUser/typesAndConst';

import {
  ENUM_STATUS,
  STATUS_ARRAY,
} from '../../../../global/enum_constant_type';
import { mongooseFileSchema } from '../../../../global/schema/global.schema';
import { ENUM_REDIS_KEY } from '../../../redis/consent.redis';
import { IProduct, ProductModel } from './interface.products';
const ProductSchema = new Schema<IProduct, ProductModel>(
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

ProductSchema.post('findOneAndDelete', async function () {
  try {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    /*  
   const dataId = this.getFilter();
    // console.log(dataId); // { _id: '6607a2b70d0b8a202a1b81b4' }
    const res = await Product.findOne({ _id: dataId?._id }).lean();
    if (res) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { status, isDelete, createdAt, updatedAt, ...otherData } = res;
      await TrashProduct.create({
        ...otherData,
      });
    } else {
      throw new ApiError(400, 'Not found this item');
    }
       */
    const dataId = this.getFilter();
    // console.log(dataId); // { _id: '6607a2b70d0b8a202a1b81b4' }
    const redisSetterOop = new RedisAllSetterServiceOop();
    await redisSetterOop
      .getGlobalRedis()
      .del(ENUM_REDIS_KEY.RIS_Product + dataId._id.toString());
  } catch (error: any) {
    // console.log('🚀 ~ error:', error);
  }
});
// after findOneAndUpdate then data then call this hook
ProductSchema.post(
  'findOneAndUpdate',
  async function (data: IProduct & { _id: string }, next: any) {
    try {
      const redisSetterOop = new RedisAllSetterServiceOop();
      await redisSetterOop
        .getGlobalRedis()
        .del(ENUM_REDIS_KEY.RIS_Product + data._id.toString());
      // console.log('update');
      next();
    } catch (error: any) {
      next(error);
    }
  },
);
ProductSchema.post(
  'save',
  async function (data: any & { _id: string }, next: any) {
    try {
      const redisSetterOop = new RedisAllSetterServiceOop();
      await redisSetterOop.redisSetter([
        {
          value: data,
          key: ENUM_REDIS_KEY.RIS_Product + data._id.toString(),
          ttl: 1 * 60 * 60,
        },
      ]);

      next();
    } catch (error: any) {
      next(error);
    }
  },
);

export const Product = model<IProduct, ProductModel>('Product', ProductSchema);
export const TrashProduct = model<IProduct, ProductModel>(
  'TrashProduct',
  ProductSchema,
);
