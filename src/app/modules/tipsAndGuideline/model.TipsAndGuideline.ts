import { Schema, model } from 'mongoose';

import { ENUM_STATUS, STATUS_ARRAY } from '../../../global/enum_constant_type';
import { mongooseFileSchema } from '../../../global/schema/global.schema';
import { mongooseIUserRef } from '../allUser/typesAndConst';
import {
  ITipsAndGuideline,
  TipsAndGuidelineModel,
} from './interface.TipsAndGuideline';

const TipsAndGuidelineSchema = new Schema<
  ITipsAndGuideline,
  TipsAndGuidelineModel
>(
  {
    title: { type: String },
    details: String,
    tips: {
      do: [{ title: String }],
      doNot: [{ title: String }],
    },
    category: {
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
      children: {
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
        children: {
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
        },
      },
    },

    author: mongooseIUserRef,
    images: [mongooseFileSchema],
    serialNumber: {
      type: Number,
      default: 1,
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
  {
    timestamps: true,
    // strict: 'throw',
    toJSON: {
      virtuals: true,
    },
  },
);
// after findOneAndDelete then data then call this hook
TipsAndGuidelineSchema.post('findOneAndDelete', async function () {
  try {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    // const dataId = this.getFilter();
    // // console.log(dataId); // { _id: '6607a2b70d0b8a202a1b81b4' }
    // const res = await TipsAndGuideline.findOne({ _id: dataId?._id }).lean();
    // if (res) {
    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   //@ts-ignore
    //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //   const { status, isDelete, createdAt, updatedAt, ...otherData } = res;
    //   await TrashTipsAndGuideline.create({
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
TipsAndGuidelineSchema.post(
  'findOneAndUpdate',
  async function (data: any & { _id: string }, next: any) {
    try {
      // console.log('update');
      next();
    } catch (error: any) {
      next(error);
    }
  },
);
// before save/create then data then call this hook
TipsAndGuidelineSchema.post(
  'save',
  async function (data: ITipsAndGuideline, next) {
    try {
      // const res = await redisClient.del(ENUM_REDIS_KEY.RIS_All_Categories);

      next();
    } catch (error: any) {
      next(error);
    }
  },
);

export const TipsAndGuideline = model<ITipsAndGuideline, TipsAndGuidelineModel>(
  'TipsAndGuideline',
  TipsAndGuidelineSchema,
);
// export const TrashTipsAndGuideline = model<
//   ITipsAndGuideline,
//   TipsAndGuidelineModel
// >('TrashTipsAndGuideline', TipsAndGuidelineSchema);
