import { Types } from 'mongoose';
import { z } from 'zod';
import { I_STATUS, STATUS_ARRAY } from '../../../global/enum_constant_type';

const createFavoriteProduct_BodyData = z.object({
  productId: z.string().or(z.instanceof(Types.ObjectId)),
  productTitle: z.string(),
  status: z.enum(STATUS_ARRAY as [I_STATUS, ...I_STATUS[]]).optional(),
  serialNumber: z.number().optional(),
  quantity: z.number().optional(),
});
const updateFavoriteProduct_BodyData = z.object({
  isDelete: z.boolean().optional(),
});
const createFavoriteProductZodSchema = z.object({
  body: createFavoriteProduct_BodyData,
});

const updateFavoriteProductZodSchema = z.object({
  body: createFavoriteProduct_BodyData
    .merge(updateFavoriteProduct_BodyData)
    .deepPartial(),
});

export const FavoriteProductValidation = {
  createFavoriteProductZodSchema,
  updateFavoriteProductZodSchema,
  //
  createFavoriteProduct_BodyData,
  updateFavoriteProduct_BodyData,
};
