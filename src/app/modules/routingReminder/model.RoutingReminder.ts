import { Schema, model } from 'mongoose';

import { ENUM_STATUS, STATUS_ARRAY } from '../../../global/enum_constant_type';
import {
  ENUM_DAYS_OF_WEEK,
  ENUM_MONTH,
} from '../../../global/enums/globalEnums';
import { mongooseIUserRef } from '../allUser/typesAndConst';
import { LOG_TYPE_ARRAY } from '../serviceLogger/constant.serviceLogger';
import {
  IRoutingReminder,
  RoutingReminderModel,
} from './interface.RoutingReminder';

const RoutingReminderSchema = new Schema<
  IRoutingReminder,
  RoutingReminderModel
>(
  {
    reminderType: {
      type: String,
      enum: LOG_TYPE_ARRAY, // Replace with the appropriate enum values
    },
    scheduleType: {
      type: String,
      enum: ['date', 'week'],
    },
    month: {
      type: String,
      enum: Object.values(ENUM_MONTH),
    },
    pickDate: {
      type: Date, // Allow different formats: string, datetime, or date
    },
    // weeksOfMonth: {
    //   type: String,
    //   enum: Object.values(ENUM_DAYS_OF_WEEK), // Enum array for weeks
    // },
    daysOfWeek: {
      type: [String],
      enum: Object.values(ENUM_DAYS_OF_WEEK), // Enum array for days
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    productUseDetails: {
      type: String,
      maxlength: 5000,
    },
    applicationStepsDetails: {
      type: String,
      maxlength: 5000,
    },
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
// after findOneAndDelete then data then call this hook
RoutingReminderSchema.post('findOneAndDelete', async function () {
  try {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    // const dataId = this.getFilter();
    // // console.log(dataId); // { _id: '6607a2b70d0b8a202a1b81b4' }
    // const res = await RoutingReminder.findOne({ _id: dataId?._id }).lean();
    // if (res) {
    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   //@ts-ignore
    //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //   const { status, isDelete, createdAt, updatedAt, ...otherData } = res;
    //   await TrashRoutingReminder.create({
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
RoutingReminderSchema.post(
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
RoutingReminderSchema.post(
  'save',
  async function (data: IRoutingReminder, next) {
    try {
      // const res = await redisClient.del(ENUM_REDIS_KEY.RIS_All_Categories);

      next();
    } catch (error: any) {
      next(error);
    }
  },
);

export const RoutingReminder = model<IRoutingReminder, RoutingReminderModel>(
  'RoutingReminder',
  RoutingReminderSchema,
);

// export const TrashRoutingReminder = model<
//   IRoutingReminder,
//   RoutingReminderModel
// >('TrashRoutingReminder', RoutingReminderSchema);
