import { Model, Types } from 'mongoose';

import { z } from 'zod';
import { I_STATUS, I_YN } from '../../../../global/enum_constant_type';
import { IUserRef } from '../../allUser/typesAndConst';
import { NonSubscriptionTransaction } from './validation.paymentHistory';

export type IPaymentHistoryFilters = {
  time?: any; // "daily" | "weekly" | "Monthly";
  productId?: string;
  orderId?: string;
  'author.userId'?: string;
  'author.roleBaseUserId'?: string;
  dateRangeFirst?: string;
  dateRangeSecond?: string;
  totalIncome?: I_YN;
  yearToQuery?: string; //only use chart
  isRefund?: string | boolean;
  //
  searchTerm?: string;
  delete?: string;
  status?: I_STATUS;
  isDelete?: string | boolean;
  createdAtFrom?: string;
  createdAtTo?: string;
  needProperty?: string;
};

export type IPaymentHistory = {
  _id?: string; //
  //
  id: string; // same pi_id not use
  pi_id: string; //pi_3PPQzrAdJu4EQtRS04CaPeUy
  ch_id: string; //latest_charge: 'ch_3PPQzrAdJu4EQtRS0Ioak1tW',
  cs_id: string; //cs_test_a1fKshnHlXhmOAVqZ0J9le7Fx8fNVYEpHyeZP9byDfjTH3qcbkaKXKGVml
  amount: number;
  amount_received: number;
  // payment_method?: any;
  created: number;
  currency: string;
  payment_intent?: string;
  payment_method_types?: any;
  customer_details?: object;
  status: 'succeeded' | string;
  orderId?: string | Types.ObjectId;
  paymentBy: 'stripe' | 'paypal' | 'manual';
  //
  revenuecatPayment?: Partial<z.infer<typeof NonSubscriptionTransaction>>;
  //
  productId?: string | Types.ObjectId;
  //
  author: IUserRef;
  //
  queue?: {
    jobId: string;
    types: I_STATUS;
  };
  refund?: {
    isRefund: boolean;
    stripeRefundId?: string;
    balance_transaction?: string;
    ch_id?: string;
  };

  isDelete?: boolean;
  //--- for --TrashPaymentHistory---
  oldRecord?: {
    refId: Types.ObjectId;
    collection?: string;
  };
};

export type PaymentHistoryModel = Model<
  IPaymentHistory,
  Record<string, unknown>
>;
