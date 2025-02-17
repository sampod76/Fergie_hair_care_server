import { Schema, model } from 'mongoose';

import { ENUM_STATUS, STATUS_ARRAY } from '../../../global/enum_constant_type';
import { mongooseIUserRef } from '../allUser/typesAndConst';
import {
  FavoriteProductModel,
  IFavoriteProduct,
} from './interface.favoriteProduct';

const FavoriteProductSchema = new Schema<
  IFavoriteProduct,
  FavoriteProductModel
>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    productTitle: String,
    author: mongooseIUserRef,
    serialNumber: {
      type: Number,
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

FavoriteProductSchema.post('findOneAndDelete', async function () {
  try {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    // const dataId = this.getFilter();
    // // console.log(dataId); // { _id: '6607a2b70d0b8a202a1b81b4' }
    // const res = await FavoriteProduct.findOne({ _id: dataId?._id }).lean();
    // if (res) {
    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   //@ts-ignore
    //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //   const { status, isDelete, createdAt, updatedAt, ...otherData } = res;
    //   await TrashFavoriteProduct.create({
    //     ...otherData,
    //   });
    // } else {
    //   throw new ApiError(400, 'Not found this item');
    // }
    // const res = await redisClient.del(ENUM_REDIS_KEY.RIS_All_Categories);
  } catch (error: any) {
    // console.log('🚀 ~ error:', error);
  }
});
// after findOneAndUpdate then data then call this hook
FavoriteProductSchema.post(
  'findOneAndUpdate',
  async function (data: any & { _id: string }, next: any) {
    try {
      // if (data?.FavoriteProductType) {
      //   const res2 = await redisClient.del(
      //     ENUM_REDIS_KEY.RIS_All_Categories + `:${data?.FavoriteProductType}`,
      //   );
      // }
      // console.log('update');
      next();
    } catch (error: any) {
      next(error);
    }
  },
);

FavoriteProductSchema.post(
  'save',
  async function (data: IFavoriteProduct, next) {
    try {
      // const res = await redisClient.del(ENUM_REDIS_KEY.RIS_All_Categories);
      // if (data?.author) {
      //   const res2 = await redisClient.del(
      //     ENUM_REDIS_KEY.RIS_All_Categories + `:${data?.FavoriteProductType}`,
      //   );
      // }
      next();
    } catch (error: any) {
      next(error);
    }
  },
);

export const FavoriteProduct = model<IFavoriteProduct, FavoriteProductModel>(
  'FavoriteProduct',
  FavoriteProductSchema,
);
export const TrashFavoriteProduct = model<
  IFavoriteProduct,
  FavoriteProductModel
>('TrashFavoriteProduct', FavoriteProductSchema);
