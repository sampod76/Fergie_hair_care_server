import { Schema, model } from 'mongoose';

import { ENUM_STATUS, STATUS_ARRAY } from '../../../global/enum_constant_type';
import { mongooseFileSchema } from '../../../global/schema/global.schema';
import { mongooseIUserRef } from '../allUser/typesAndConst';
import { LOG_TYPE_ARRAY } from './constant.serviceLogger';
import { IServiceLogger, ServiceLoggerModel } from './interface.serviceLogger';
const categoryValue = new Schema({
  value: {
    type: String,
    trim: true,
  },
  label: {
    type: String,
    trim: true,
  },
  uid: {
    type: String,
    trim: true,
  },
});

const ServiceLoggerSchema = new Schema<IServiceLogger, ServiceLoggerModel>(
  {
    logType: { type: String, enum: LOG_TYPE_ARRAY }, //
    logDate: Date,
    author: mongooseIUserRef,
    images: [mongooseFileSchema],
    //
    Wash_Day_Mood: categoryValue,
    Choice_of_Treatment: categoryValue,
    Post_Wash_Day_Style: categoryValue,
    Hair_Health: categoryValue,
    //logStyleArchive
    What_Style_Did_You_Do: categoryValue,
    Style_Rating: categoryValue,
    Hair_Service_Quality: categoryValue,
    Duration_of_style_wear: categoryValue,
    Maintenance_Routine: categoryValue,
    //logTrimTracker
    Haircut_Type: categoryValue,
    Length_Cut: categoryValue,
    //

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
// after findOneAndDelete then data then call this hook
ServiceLoggerSchema.post('findOneAndDelete', async function () {
  try {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    // const dataId = this.getFilter();
    // // console.log(dataId); // { _id: '6607a2b70d0b8a202a1b81b4' }
    // const res = await ServiceLogger.findOne({ _id: dataId?._id }).lean();
    // if (res) {
    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   //@ts-ignore
    //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //   const { status, isDelete, createdAt, updatedAt, ...otherData } = res;
    //   await TrashServiceLogger.create({
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
ServiceLoggerSchema.post(
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
ServiceLoggerSchema.post('save', async function (data: IServiceLogger, next) {
  try {
    // const res = await redisClient.del(ENUM_REDIS_KEY.RIS_All_Categories);

    next();
  } catch (error: any) {
    next(error);
  }
});

export const ServiceLogger = model<IServiceLogger, ServiceLoggerModel>(
  'ServiceLogger',
  ServiceLoggerSchema,
);
// export const TrashServiceLogger = model<
//   IServiceLogger,
//   ServiceLoggerModel
// >('TrashServiceLogger', ServiceLoggerSchema);
