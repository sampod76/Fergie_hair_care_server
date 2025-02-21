import { Schema, model } from 'mongoose';

import { mongooseIUserRef } from '../../allUser/typesAndConst';

import {
  IPaymentHistory,
  PaymentHistoryModel,
} from './interface.paymentHistory';
const PaymentHistorySchema = new Schema<IPaymentHistory, PaymentHistoryModel>(
  {
    pi_id: String,
    ch_id: String,
    cs_id: String,
    //
    amount: Number,
    amount_received: Number,
    // payment_method: String,
    created: Number,
    currency: String,
    payment_intent: String,
    status: String,
    payment_method_types: [String],
    paymentBy: { type: String, enum: ['stripe', 'paypal', 'manual'] },
    //
    revenuecatPayment: Object,
    //
    productIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    //
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    author: mongooseIUserRef,
    //
    refund: {
      isRefund: {
        type: Boolean,
        default: false,
      },
      stripeRefundId: String,
      balance_transaction: String,
      ch_id: String,
    },
    customer_details: Object,
    isDelete: {
      type: Boolean,
      default: false,
      index: true,
    },
    //--- for --TrashPaymentHistory---
    oldRecord: {
      refId: { type: Schema.Types.ObjectId, ref: 'PaymentHistories' },
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

PaymentHistorySchema.post('findOneAndDelete', async function (next) {
  try {
    next();
  } catch (error: any) {
    next(error);
  }
});

export const PaymentHistory = model<IPaymentHistory, PaymentHistoryModel>(
  'PaymentHistory',
  PaymentHistorySchema,
);

export const TrashPaymentHistory = model<IPaymentHistory, PaymentHistoryModel>(
  'TrashPaymentHistory',
  PaymentHistorySchema,
);
