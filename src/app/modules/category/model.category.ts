import { Schema, model } from 'mongoose';

import { ENUM_STATUS, STATUS_ARRAY } from '../../../global/enum_constant_type';
import { mongooseFileSchema } from '../../../global/schema/global.schema';
import { UuidBuilder } from '../../../utils/uuidGenerator';
import ApiError from '../../errors/ApiError';
import { ENUM_REDIS_KEY } from '../../redis/consent.redis';
import { redisClient } from '../../redis/redis';
import { CategoryModel, ICategory } from './interface.category';
const childCategorySchema = new Schema(
  {
    title: {
      type: String,
    },
    subTitle: {
      type: String,
    },
    uid: {
      type: String,
    },
    serialNumber: {
      type: Number,
    },
    children: [
      {
        title: {
          type: String,
        },
        subTitle: {
          type: String,
        },
        uid: {
          type: String,
        },
        serialNumber: {
          type: Number,
        },
      },
    ],
  },
  { _id: false },
);
const CategorySchema = new Schema<ICategory, CategoryModel>(
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
    children: [childCategorySchema],
    uid: {
      type: String,
      trim: true,
      index: true,
      default: function () {
        const uuidGenerate = new UuidBuilder();
        return uuidGenerate.generateUuid();
      },
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

CategorySchema.post('findOneAndDelete', async function () {
  try {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const dataId = this.getFilter();
    // console.log(dataId); // { _id: '6607a2b70d0b8a202a1b81b4' }
    const res = await Category.findOne({ _id: dataId?._id }).lean();
    if (res) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { status, isDelete, createdAt, updatedAt, ...otherData } = res;
      await TrashCategory.create({
        ...otherData,
      });
    } else {
      throw new ApiError(400, 'Not found this item');
    }
    await redisClient.del(ENUM_REDIS_KEY.RIS_Categories);
  } catch (error: any) {
    // console.log('🚀 ~ error:', error);
  }
});
// after findOneAndUpdate then data then call this hook
CategorySchema.post(
  'findOneAndUpdate',
  async function (data: any & { _id: string }, next: any) {
    try {
      await redisClient.del(ENUM_REDIS_KEY.RIS_Categories);
      // console.log('update');
      next();
    } catch (error: any) {
      next(error);
    }
  },
);

export const Category = model<ICategory, CategoryModel>(
  'Category',
  CategorySchema,
);
export const TrashCategory = model<ICategory, CategoryModel>(
  'TrashCategory',
  CategorySchema,
);
