import { model, PipelineStage, Schema, Types } from 'mongoose';

import {
  ENUM_STATUS,
  ENUM_YN,
  STATUS_ARRAY,
} from '../../../../global/enum_constant_type';
import {
  ILookupCollection,
  LookupAnyRoleDetailsReusable,
  LookupReusable,
} from '../../../../helper/lookUpResuable';
import { logger } from '../../../share/logger';
import { mongooseIUserRef } from '../../allUser/typesAndConst';
import { NotificationService } from '../../notification/notification.service';
import { IOrder, OrderModel } from './interface.order';
import { ORDER_STATUS_ARRAY } from './validation.order';

const OrderSchema = new Schema<IOrder, OrderModel>(
  {
    author: mongooseIUserRef,
    cs_id: { type: String }, //when buyer try payment first time create session then set session to session.id-->  cs_id
    pi_id: { type: String },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' }, //when successfully payment then set paymentId(my database)
    paymentBy: { type: String, enum: ['stripe', 'paypal', 'manual'] },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 },
    note: String,
    orderStatus: { type: String, enum: ORDER_STATUS_ARRAY },
    totalPrice: { type: Number },
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
  },
  {
    timestamps: true,
  },
);
OrderSchema.statics.isOrderExistMethod = async function (
  id: string,
  option?: {
    isDelete?: boolean;
    populate?: boolean;
    needProperty?: string[];
  },
): Promise<IOrder | null> {
  let data;
  if (!option?.populate) {
    const result = await Order.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(id),
          isDelete: option?.isDelete || ENUM_YN.NO,
        },
      },
    ]);
    data = result[0];
  } else {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          _id: new Types.ObjectId(id),
          isDelete: option.isDelete || ENUM_YN.NO,
        },
      },
    ];
    //!-----------------------start --lookup-----------------
    // Define the collections array with the correct type
    const collections: ILookupCollection<any>[] = []; // Use the correct type here

    if (option.needProperty && option.needProperty.includes('author')) {
      LookupAnyRoleDetailsReusable(pipeline, {
        collections: [
          {
            roleMatchFiledName: 'author.role',
            idFiledName: '$author.roleBaseUserId',
            pipeLineMatchField: '$_id',
            outPutFieldName: 'details',
            margeInField: 'author',
          },
        ],
      });
    }

    if (option.needProperty && option.needProperty.includes('paymentId')) {
      const pipelineConnection: ILookupCollection<any> = {
        connectionName: 'paymenthistories',
        idFiledName: 'paymentId',
        pipeLineMatchField: '_id',
        outPutFieldName: 'paymentDetails',
      };
      collections.push(pipelineConnection);
    }

    // Use the collections in LookupReusable
    LookupReusable<any, any>(pipeline, {
      collections: collections,
    });
    //!-------------------------lookup------------------------

    const result = await Order.aggregate(pipeline);

    data = result[0];
  }
  return data;
};
// before save then data then call this hook
OrderSchema.pre('save', async function (next) {
  try {
    const data = this as unknown as IOrder;
    try {
      await NotificationService.createNotificationToDB(
        {
          userIds: [data.author.userId],
          subject: 'New Order',
          bodyText: `Get new order`,
        },
        ENUM_YN.YES,
      );
    } catch (error) {
      logger.error(error);
    }
    next();
  } catch (error: any) {
    next(error);
  }
});
OrderSchema.post('findOneAndUpdate', async function (data, next) {
  try {
    next();
  } catch (error: any) {
    next(error);
  }
});

export const Order = model<IOrder, OrderModel>('Order', OrderSchema);
