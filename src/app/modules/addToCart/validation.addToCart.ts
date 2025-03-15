import { Types } from 'mongoose';
import { z } from 'zod';
import { I_STATUS, STATUS_ARRAY } from '../../../global/enum_constant_type';

const createAddToCartBodyData = z.object({
  productId: z.string().or(z.instanceof(Types.ObjectId)),
  productTitle: z.string(),
  status: z.enum(STATUS_ARRAY as [I_STATUS, ...I_STATUS[]]).optional(),
  serialNumber: z.number().optional(),
  quantity: z.number({ required_error: 'Quantity is required' }),
});
const createAddToCartZodSchema = z.object({
  body: createAddToCartBodyData,
});

const updateAddToCartZodSchema = z.object({
  body: createAddToCartBodyData
    .merge(
      z.object({
        isDelete: z.boolean().optional(),
      }),
    )
    .deepPartial(),
});

export const AddToCartValidation = {
  createAddToCartZodSchema,
  updateAddToCartZodSchema,
  //
  createAddToCartBodyData,
};
