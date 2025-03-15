import { Schema, model } from 'mongoose';

import { ENUM_STATUS, STATUS_ARRAY } from '../../../global/enum_constant_type';
import { mongooseIUserRef } from '../allUser/typesAndConst';
import { AddToCartModel, IAddToCart } from './interface.addToCart';

const AddToCartSchema = new Schema<IAddToCart, AddToCartModel>(
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
    quantity: { type: Number, default: 1 },
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

AddToCartSchema.post('findOneAndDelete', async function () {
  try {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    // const dataId = this.getFilter();
    // // console.log(dataId); // { _id: '6607a2b70d0b8a202a1b81b4' }
    // const res = await AddToCart.findOne({ _id: dataId?._id }).lean();
    // if (res) {
    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   //@ts-ignore
    //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //   const { status, isDelete, createdAt, updatedAt, ...otherData } = res;
    //   await TrashAddToCart.create({
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
AddToCartSchema.post(
  'findOneAndUpdate',
  async function (data: any & { _id: string }, next: any) {
    try {
      // if (data?.AddToCartType) {
      //   const res2 = await redisClient.del(
      //     ENUM_REDIS_KEY.RIS_All_Categories + `:${data?.AddToCartType}`,
      //   );
      // }
      // console.log('update');
      next();
    } catch (error: any) {
      next(error);
    }
  },
);

AddToCartSchema.post('save', async function (data: IAddToCart, next) {
  try {
    // const res = await redisClient.del(ENUM_REDIS_KEY.RIS_All_Categories);
    // if (data?.author) {
    //   const res2 = await redisClient.del(
    //     ENUM_REDIS_KEY.RIS_All_Categories + `:${data?.AddToCartType}`,
    //   );
    // }
    next();
  } catch (error: any) {
    next(error);
  }
});

export const AddToCart = model<IAddToCart, AddToCartModel>(
  'AddToCart',
  AddToCartSchema,
);
export const TrashAddToCart = model<IAddToCart, AddToCartModel>(
  'TrashAddToCart',
  AddToCartSchema,
);
