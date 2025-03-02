import {
  CallbackWithoutResultAndOptionalError,
  model,
  PipelineStage,
  Schema,
  Types,
} from 'mongoose';

import {
  ENUM_STATUS,
  STATUS_ARRAY,
} from '../../../../global/enum_constant_type';
import { mongooseFileSchema } from '../../../../global/schema/global.schema';
import { LookupReusable } from '../../../../helper/lookUpResuable';
import { ENUM_VERIFY, mongooseIUserRef, VERIFY_ARRAY } from '../typesAndConst';
import { ENUM_ACCOUNT_TYPE, I_AccountTypeArray } from '../user/user.interface';
import { GeneralUserModel, IGeneralUser } from './interface.generalUser';

const GeneralSchema = new Schema<IGeneralUser, GeneralUserModel>(
  {
    userUniqueId: {
      type: String,
      required: true,
      //
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      //
      trim: true,
    },
    accountType: {
      type: String,
      enum: I_AccountTypeArray,
      default: ENUM_ACCOUNT_TYPE.custom,
    },
    authUserId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor', // when general user create vendor
    },
    name: {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
    },
    // userName: { type: String, trim: true },
    address: { area: { type: String, trim: true } },
    country: {
      name: { type: String, trim: true },
      flag: { url: String },
      isoCode: String,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      trim: true,
    },
    category: [
      {
        value: {
          type: String,
        },
        label: {
          type: String,
        },
        uid: {
          type: String,
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
            },
          },
        },
      },
    ],
    // gender: {
    //   type: String,
    //   enum: GENDER_ARRAY,
    // },
    profileImage: mongooseFileSchema,
    verify: {
      type: String,
      enum: VERIFY_ARRAY,
      default: ENUM_VERIFY.ACCEPT,
    },
    author: mongooseIUserRef,
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
    toJSON: {
      virtuals: true,
    },
  },
);

GeneralSchema.statics.isGeneralUserExistMethod = async function (
  id: string,
  option?: Partial<{
    isDelete: boolean;
    populate: boolean;
    needProperty?: string[];
  }>,
): Promise<IGeneralUser | null> {
  let user;
  if (!option?.populate) {
    const result = await GeneralUser.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(id),
          isDelete: option?.isDelete || false,
        },
      },
      {
        $project: { password: 0, secret: 0 },
      },
    ]);
    user = result[0];
  } else {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          _id: new Types.ObjectId(id),
          isDelete: option.isDelete || false,
        },
      },
    ];
    LookupReusable(pipeline, {
      collections: [
        {
          connectionName: 'users',
          idFiledName: 'userId',
          pipeLineMatchField: '_id',
          outPutFieldName: 'userDetails',
        },
      ],
    });
    const result = await GeneralUser.aggregate(pipeline);
    user = result[0];
  }
  return user;
};

GeneralSchema.pre(
  'save',
  async function (next: CallbackWithoutResultAndOptionalError) {
    try {
      // const General = this;
      // const existUser = await General.findOne({ userName: General?.userName });
      // if (existUser) {
      //   throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'User Name already exist');
      // }
      next();
      // Add your business logic here
    } catch (error: any) {
      next(error);
    }
  },
);

export const GeneralUser = model<IGeneralUser, GeneralUserModel>(
  'GeneralUser',
  GeneralSchema,
);
