import { Schema, model } from 'mongoose';

import { ENUM_STATUS, STATUS_ARRAY } from '../../../global/enum_constant_type';
import { mongooseFileSchema } from '../../../global/schema/global.schema';
import ApiError from '../../errors/ApiError';
import { ENUM_REDIS_KEY } from '../../redis/consent.redis';
import { redisClient } from '../../redis/redis';
import {
  IProductCategory,
  ProductCategoryModel,
} from './interface.productCategory';
const ProductCategorySchema = new Schema<
  IProductCategory,
  ProductCategoryModel
>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subTitle: {
      type: String,
    },

    image: mongooseFileSchema,
    files: [mongooseFileSchema],
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

ProductCategorySchema.post('findOneAndDelete', async function () {
  try {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const dataId = this.getFilter();
    // console.log(dataId); // { _id: '6607a2b70d0b8a202a1b81b4' }
    const res = await ProductCategory.findOne({ _id: dataId?._id }).lean();
    if (res) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { status, isDelete, createdAt, updatedAt, ...otherData } = res;
      await TrashProductCategory.create({
        ...otherData,
      });
    } else {
      throw new ApiError(400, 'Not found this item');
    }
    await redisClient.del(ENUM_REDIS_KEY.RIS_ProductsCategories);
  } catch (error: any) {
    // console.log('🚀 ~ error:', error);
  }
});
// after findOneAndUpdate then data then call this hook
ProductCategorySchema.post(
  'findOneAndUpdate',
  async function (data: any & { _id: string }, next: any) {
    try {
      await redisClient.del(ENUM_REDIS_KEY.RIS_ProductsCategories);
      // console.log('update');
      next();
    } catch (error: any) {
      next(error);
    }
  },
);

export const ProductCategory = model<IProductCategory, ProductCategoryModel>(
  'ProductCategory',
  ProductCategorySchema,
);
export const TrashProductCategory = model<
  IProductCategory,
  ProductCategoryModel
>('TrashProductCategory', ProductCategorySchema);
