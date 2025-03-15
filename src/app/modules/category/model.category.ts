import { Schema, model } from 'mongoose';

import { ENUM_STATUS, STATUS_ARRAY } from '../../../global/enum_constant_type';
import { mongooseFileSchema } from '../../../global/schema/global.schema';
import { ENUM_REDIS_KEY } from '../../redis/consent.redis';
import { redisClient } from '../../redis/redis';
import { CategoryModel, ICategory } from './interface.category';
const childCategorySchema = new Schema(
  {
    value: {
      type: String,
    },
    label: {
      type: String,
    },
    uid: {
      type: String,
      trim: true,
    },
    serialNumber: {
      type: Number,
    },
    children: [
      {
        value: {
          type: String,
        },
        label: {
          type: String,
        },
        uid: {
          type: String,
          trim: true,
        },
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
        },
      },
    ],
    status: {
      type: String,
      enum: STATUS_ARRAY,
      default: ENUM_STATUS.ACTIVE,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);
const CategorySchema = new Schema<ICategory, CategoryModel>(
  {
    value: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
    },
    children: [childCategorySchema],
    uid: {
      type: String,
      trim: true,
    },
    image: mongooseFileSchema,

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
    //--- for --TrashCategory---
    oldRecord: {
      refId: { type: Schema.Types.ObjectId, ref: 'Category' },
      collection: String,
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
// after findOneAndUpdate then data then call this hook
CategorySchema.post('findOneAndDelete', async function (data: ICategory) {
  try {
    if (!data) {
      console.log('No document found for deletion');
      return;
    }
    //@ts-ignore
    if (typeof data?.toObject === 'function') {
      //@ts-ignore
      data = data?.toObject();
    }
    // Clear Redis Cache (if applicable)
    const res = await redisClient.del(ENUM_REDIS_KEY.RIS_All_Categories);
    if (data?.categoryType) {
      const res2 = await redisClient.del(
        ENUM_REDIS_KEY.RIS_All_Categories + `:${data?.categoryType}`,
      );
    }
  } catch (error: any) {
    console.error('Error in post-delete hook:', error);
  }
});
// after findOneAndUpdate then data then call this hook
CategorySchema.post(
  'findOneAndUpdate',
  async function (data: ICategory & { _id: string }, next: any) {
    try {
      //@ts-ignore
      if (typeof data?.toObject === 'function') {
        //@ts-ignore
        data = data?.toObject();
      }
      const res = await redisClient.del(ENUM_REDIS_KEY.RIS_All_Categories);
      if (data?.categoryType) {
        const res2 = await redisClient.del(
          ENUM_REDIS_KEY.RIS_All_Categories + `:${data?.categoryType}`,
        );
      }
      // console.log('update');
      next();
    } catch (error: any) {
      next(error);
    }
  },
);
//after save
CategorySchema.post('save', async function (data: ICategory, next) {
  try {
    //@ts-ignore
    if (typeof data?.toObject === 'function') {
      //@ts-ignore
      data = data?.toObject();
    }

    const res = await redisClient.del(ENUM_REDIS_KEY.RIS_All_Categories);
    if (data?.categoryType) {
      const res2 = await redisClient.del(
        ENUM_REDIS_KEY.RIS_All_Categories + `:${data?.categoryType}`,
      );
    }
    next();
  } catch (error: any) {
    next(error);
  }
});

// Before save
CategorySchema.pre('save', async function (next) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const data = this;
    // console.log('🚀 ~ data:', data);
    next();
  } catch (error: any) {
    next(error);
  }
});

export const Category = model<ICategory, CategoryModel>(
  'Category',
  CategorySchema,
);
export const TrashCategory = model<ICategory, CategoryModel>(
  'TrashCategory',
  CategorySchema,
);
