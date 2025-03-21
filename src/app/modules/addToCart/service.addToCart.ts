/* eslint-disable @typescript-eslint/no-unused-vars */
import { PipelineStage, Types } from 'mongoose';
import { paginationHelper } from '../../../helper/paginationHelper';

import { IGenericResponse } from '../../interface/common';
import { IPaginationOption } from '../../interface/pagination';

import { Request } from 'express';
import httpStatus from 'http-status';
import { ENUM_USER_ROLE } from '../../../global/enums/users';
import {
  ILookupCollection,
  LookupAnyRoleDetailsReusable,
  LookupReusable,
} from '../../../helper/lookUpResuable';
import ApiError from '../../errors/ApiError';
import { ENUM_REDIS_KEY } from '../../redis/consent.redis';
import { RedisAllSetterServiceOop } from '../../redis/service.redis';
import { IUserRef } from '../allUser/typesAndConst';
import { AddToCart_SEARCHABLE_FIELDS } from './constant.addToCart';
import { IAddToCart, IAddToCartFilters } from './interface.addToCart';
import { AddToCart } from './model.addToCart';
import { AddToCartOop } from './utls.addToCart';

const createAddToCartByDb = async (
  payload: IAddToCart,
  req: Request,
): Promise<IAddToCart | null> => {
  const user = req.user as IUserRef;

  const [findAlreadyExists] = await Promise.all([
    AddToCart.findOne({
      'author.userId': new Types.ObjectId(user.userId),
      productId: new Types.ObjectId(payload.productId),
      isDelete: false,
    }),
  ]);

  if (findAlreadyExists?.quantity === payload.quantity) {
    return findAlreadyExists;
  }
  if (findAlreadyExists) {
    findAlreadyExists.quantity = payload.quantity;
    await findAlreadyExists.save();
    return findAlreadyExists;
  }
  const result = await AddToCart.create(payload);
  return result;
};

//getAllAddToCartFromDb
const getAllAddToCartFromDb = async (
  filters: IAddToCartFilters,
  paginationOptions: IPaginationOption,
  req: Request,
): Promise<IGenericResponse<IAddToCart[]>> => {
  const user = req?.user as IUserRef;
  //****************search and filters start************/
  const {
    searchTerm,
    createdAtFrom,
    createdAtTo,
    needProperty,
    ...filtersData
  } = filters;
  //***********cache start************* */
  if (user.role !== ENUM_USER_ROLE.admin) {
    filtersData['author.userId'] = user.userId.toString();
  }
  filtersData.isDelete = filtersData.isDelete
    ? filtersData.isDelete == 'true'
      ? true
      : false
    : false;
  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      $or: AddToCart_SEARCHABLE_FIELDS.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    const condition = Object.entries(filtersData).map(
      //@ts-ignore
      ([field, value]: [keyof typeof filtersData, string]) => {
        let modifyFiled;
        /* 
        if (field === 'userRoleBaseId' || field === 'referRoleBaseId') {
        modifyFiled = { [field]: new Types.ObjectId(value) };
        } else {
         modifyFiled = { [field]: value };
         } 
       */
        if (
          field === 'author.userId' ||
          field === 'author.roleBaseUserId' ||
          field === 'productId'
        ) {
          modifyFiled = {
            [field]: new Types.ObjectId(value),
          };
        } else {
          modifyFiled = { [field]: value };
        }
        // console.log(modifyFiled);
        return modifyFiled;
      },
    );
    //
    if (createdAtFrom && !createdAtTo) {
      const timeTo = new Date(createdAtFrom);
      const createdAtToModify = new Date(timeTo.setHours(23, 59, 59, 999));
      condition.push({
        //@ts-ignore
        createdAt: {
          //@ts-ignore
          $gte: new Date(createdAtFrom),
          $lte: new Date(createdAtToModify),
        },
      });
    } else if (createdAtFrom && createdAtTo) {
      condition.push({
        //@ts-ignore
        createdAt: {
          //@ts-ignore
          $gte: new Date(createdAtFrom),
          $lte: new Date(createdAtTo),
        },
      });
    }

    //
    andConditions.push({
      $and: condition,
    });
  }

  //****************search and filters end**********/

  //****************pagination start **************/
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);

  const sortConditions: { [key: string]: 1 | -1 } = {};
  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder === 'asc' ? 1 : -1;
  }
  //****************pagination end ***************/

  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  // const result = await AddToCart.find(whereConditions)
  //   .populate('thumbnail')
  //   .sort(sortConditions)
  //   .skip(Number(skip))
  //   .limit(Number(limit));
  const pipeline: PipelineStage[] = [
    { $match: whereConditions },
    { $sort: sortConditions },
    { $skip: Number(skip) || 0 },
    { $limit: Number(limit) || 10 },
  ];
  const collections: ILookupCollection<any>[] = []; // Use the correct type here
  if (needProperty?.includes('productId')) {
    const pipelineConnection: ILookupCollection<any> = {
      connectionName: 'products',
      idFiledName: 'productId',
      pipeLineMatchField: '_id',
      outPutFieldName: 'productDetails',
    };
    collections.push(pipelineConnection);
  }
  if (needProperty && needProperty.includes('author')) {
    LookupAnyRoleDetailsReusable(pipeline, {
      collections: [
        {
          roleMatchFiledName: 'author.role',
          idFiledName: '$author.roleBaseUserId',
          pipeLineMatchField: '$_id',
          outPutFieldName: 'details',
          margeInField: 'author',
          project: { name: 1, email: 1, profileImage: 1, userId: 1 },
        },
      ],
    });
  }
  if (collections.length) {
    // Use the collections in LookupReusable
    LookupReusable<any, any>(pipeline, {
      collections: collections,
    });
  }

  // const result = await AddToCart.aggregate(pipeline);
  // const total = await AddToCart.countDocuments(whereConditions);
  const [result, total] = await Promise.all([
    AddToCart.aggregate(pipeline),
    AddToCart.countDocuments(whereConditions),
  ]);
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// get single AddToCarte form db
const getSingleAddToCartFromDb = async (
  id: string,
  filters: IAddToCartFilters,
  req: Request,
): Promise<IAddToCart | null> => {
  const user = req.user as IUserRef;
  const pipeline: PipelineStage[] = [
    { $match: { _id: new Types.ObjectId(id), isDelete: false } },
    ///***************** */ images field ******start
  ];
  const result = await AddToCart.aggregate(pipeline);
  const dataReturn = result.length ? result[0] : null;
  if (!dataReturn) {
    throw new ApiError(httpStatus.NOT_FOUND, 'AddToCart not found');
  }
  if (
    dataReturn.author.userId.toString() !== user.userId.toString() &&
    user.role !== ENUM_USER_ROLE.admin
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to delete');
  }
  return dataReturn;
};

// update AddToCarte form db
const updateAddToCartFromDb = async (
  id: string,
  payload: Partial<IAddToCart>,
  req: Request,
): Promise<IAddToCart | null> => {
  const user = req.user as IUserRef;
  const cartOop = new AddToCartOop(id);
  const isExist = await cartOop.getAndSetCase();
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'AddToCart not found');
  }
  if (
    isExist.author.userId.toString() !== user.userId.toString() &&
    user.role !== ENUM_USER_ROLE.admin
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to delete');
  }
  const result = await AddToCart.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return result;
};

// delete AddToCarte form db
const deleteAddToCartByIdFromDb = async (
  id: string,
  query: IAddToCartFilters,
  req: Request,
): Promise<IAddToCart | null> => {
  const user = req.user as IUserRef;
  const cartOop = new AddToCartOop(id);
  const isExist = await cartOop.getAndSetCase();

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'AddToCart not found');
  }
  if (
    isExist.author.userId.toString() !== user.userId.toString() &&
    user.role !== ENUM_USER_ROLE.admin
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to delete');
  }

  const result = await AddToCart.findOneAndUpdate(
    { _id: id },
    { isDelete: true },
    { new: true, runValidators: true },
  );
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Failed to delete');
  }
  const setter = new RedisAllSetterServiceOop();
  await setter.deleteAnyPattern(
    `${ENUM_REDIS_KEY.RIS_AddToCart}${user.userId.toString()}:${id}`,
  );
  return result;
};
//
const updateAddToCartSerialNumberFromDb = async (
  payload: { _id: string; number: number }[],
): Promise<IAddToCart[] | null> => {
  const premissAll: any = [];
  for (let i = 0; i < payload.length; i++) {
    premissAll.push(
      AddToCart.findByIdAndUpdate(
        payload[i]._id,
        { serialNumber: payload[i].number },
        { new: true, runValidators: true },
      ),
    );
  }
  const result = await Promise.all(premissAll);
  // console.log('🚀 ~ result:', result);
  return result;
};

export const AddToCartService = {
  createAddToCartByDb,
  getAllAddToCartFromDb,
  getSingleAddToCartFromDb,
  updateAddToCartFromDb,
  deleteAddToCartByIdFromDb,
  //
  updateAddToCartSerialNumberFromDb,
};
