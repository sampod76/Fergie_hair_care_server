import { Model, Types } from 'mongoose';
import { z } from 'zod';

import { IUserRef } from '../../allUser/typesAndConst';
import { I_OrderStatus, OrderValidation } from './validation.order';

export type IOrderFilters = {
  myData?: string;
  'author.userId'?: string;
  'author.roleBaseUserId'?: string;
  packageId?: string;
  paymentId?: string;
  orderType?: string;

  //
  searchTerm?: string;
  delete?: string;
  status?: string;
  isDelete?: string | boolean;
  //
  createdAtFrom?: string;
  createdAtTo?: string;
  needProperty?: string;
  //
};

export type IOrder = z.infer<typeof OrderValidation.OrderBodyData> &
  z.infer<typeof OrderValidation.OrderUpdateBodyDate> & {
    author: IUserRef;
    orderStatus: I_OrderStatus;
    cs_id?: string;
    pi_id?: string;
    productId: Types.ObjectId | string;
    paymentBy: 'stripe' | 'paypal' | 'manual';
    _id: string;
  };
export type OrderModel = {
  isOrderExistMethod(
    id: string,
    option: {
      isDelete?: boolean;
      populate?: boolean;
      needProperty?: string[];
    },
  ): Promise<IOrder>;
} & Model<IOrder, Record<string, unknown>>;
