/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from 'zod';

import { Types } from 'mongoose';

import { I_STATUS, STATUS_ARRAY } from '../../../../global/enum_constant_type';
import { ENUM_ORDER_STATUS } from './constants.order';
export const ORDER_STATUS_ARRAY = Object.values(ENUM_ORDER_STATUS);
export type I_OrderStatus = keyof typeof ENUM_ORDER_STATUS;

const OrderBodyData = z.object({
  // seller: zodRefUser,
  // buyer: zodRefUser,
  productId: z
    .string({ required_error: 'productId is required' })
    .or(z.instanceof(Types.ObjectId)),
  paymentId: z.string().or(z.instanceof(Types.ObjectId)).optional(), //!set by service auto
  quantity: z.number().default(1),
  totalPrice: z.number(),
  note: z.string().max(5000).trim().optional(),
});

const OrderUpdateBodyDate = z.object({
  status: z.enum(STATUS_ARRAY as [I_STATUS, ...I_STATUS[]]).optional(),
  orderStatus: z.enum(ORDER_STATUS_ARRAY as [I_OrderStatus]).optional(),
  isDelete: z.boolean().optional(),
});

const createOrderBodySchema = OrderBodyData;

const createOrderZodSchema = z.object({
  body: createOrderBodySchema,
});

const updateOrderZodSchema = z.object({
  body: OrderBodyData.merge(OrderUpdateBodyDate).deepPartial(),
});

export const OrderValidation = {
  createOrderZodSchema,
  updateOrderZodSchema,
  OrderBodyData,
  OrderUpdateBodyDate,
};
