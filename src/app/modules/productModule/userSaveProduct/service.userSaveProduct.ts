/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from 'express';
import httpStatus from 'http-status';
import { PipelineStage, Schema, Types } from 'mongoose';
import { ENUM_USER_ROLE } from '../../../../global/enums/users';
import { paginationHelper } from '../../../../helper/paginationHelper';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interface/common';
import { IPaginationOption } from '../../../interface/pagination';
import { IUserRef, IUserRefAndDetails } from '../../allUser/typesAndConst';
import { userSaveProduct_SEARCHABLE_FIELDS } from './consent.userSaveProduct';
import {
  IUserSaveProduct,
  IUserSaveProductFilters,
} from './interface.userSaveProduct';
import { UserSaveProduct } from './model.userSaveProduct';

const createUserSaveProductByDb = async (
  payload: IUserSaveProduct,
  req: Request,
): Promise<IUserSaveProduct> => {
  const [findIndex] = await Promise.all([
    UserSaveProduct.findOne({
      isDelete: false,
    }).sort({ serialNumber: -1 }),
  ]);

  payload.serialNumber = findIndex?.serialNumber
    ? findIndex?.serialNumber + 1
    : 1;

  const result = await UserSaveProduct.create(payload);
  return result;
};

//getAllUserSaveProductFromDb
const getAllUserSaveProductFromDb = async (
  filters: IUserSaveProductFilters,
  paginationOptions: IPaginationOption,
  req: Request,
): Promise<IGenericResponse<IUserSaveProduct[]>> => {
  const user = req?.user as IUserRefAndDetails;
  //****************search and filters start************/
  const {
    searchTerm,
    createdAtTo,
    createdAtFrom,
    needProperty,
    ...filtersData
  } = filters;

  filtersData.isDelete = filtersData.isDelete
    ? filtersData.isDelete == 'true'
      ? true
      : false
    : false;
  if (user.role !== ENUM_USER_ROLE.admin) {
    filtersData['author.userId'] = user.userId.toString();
  }
  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      $or: userSaveProduct_SEARCHABLE_FIELDS.map(field => ({
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

        if (
          field === 'author.userId' ||
          field === 'author.roleBaseUserId' ||
          field === 'productCategoryId'
        ) {
          modifyFiled = { [field]: new Types.ObjectId(value) };
        } else {
          modifyFiled = { [field]: value };
        }
        return modifyFiled;
      },
    );

    if (createdAtFrom && !createdAtTo) {
      //only single data in register all data -> 2022-02-25_12:00 am to 2022-02-25_11:59 pm minutes
      const timeTo = new Date(createdAtFrom);
      const createdAtToModify = new Date(timeTo.setHours(23, 59, 59, 999));
      condition.push({
        createdAt: {
          //@ts-ignore
          $gte: new Date(createdAtFrom),
          $lte: new Date(createdAtToModify),
        },
      });
    } else if (createdAtFrom && createdAtTo) {
      condition.push({
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

  // const result = await UserSaveProduct.find(whereConditions)
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
  const [result, total] = await Promise.all([
    UserSaveProduct.aggregate(pipeline),
    UserSaveProduct.countDocuments(whereConditions),
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

// get single UserSaveProducte form db
const getSingleUserSaveProductFromDb = async (
  id: string,
  filters: IUserSaveProductFilters,
  req: Request,
): Promise<IUserSaveProduct | null> => {
  const pipeline: PipelineStage[] = [
    { $match: { _id: new Types.ObjectId(id) } },
    ///***************** */ images field ******start
  ];

  const result = await UserSaveProduct.aggregate(pipeline);
  if (result.length) {
    if (result[0].isDelete === true) {
      result[0] = [];
    }
  }
  return result[0];
};

// update UserSaveProducte form db
const updateUserSaveProductFromDb = async (
  id: string,
  payload: Partial<IUserSaveProduct>,
  user: IUserRef,
  req: Request,
): Promise<IUserSaveProduct | null> => {
  const isExist = (await UserSaveProduct.findById(id)) as IUserSaveProduct & {
    _id: Schema.Types.ObjectId;
  };
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'UserSaveProduct not found');
  }
  if (
    user?.role !== ENUM_USER_ROLE.superAdmin &&
    user?.role !== ENUM_USER_ROLE.admin &&
    isExist?._id?.toString() !== user?.roleBaseUserId?.toString() &&
    isExist.author.userId.toString() !== user?.userId?.toString()
  ) {
    throw new ApiError(403, 'forbidden access');
  }
  const result = await UserSaveProduct.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return result;
};

// delete UserSaveProducte form db
const deleteUserSaveProductByIdFromDb = async (
  id: string,
  query: IUserSaveProductFilters,
  user: IUserRef,
  req: Request,
): Promise<IUserSaveProduct | null> => {
  const isExist = (await UserSaveProduct.findById(id)) as IUserSaveProduct & {
    _id: Schema.Types.ObjectId;
  };
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'UserSaveProduct not found');
  }
  if (
    user?.role !== ENUM_USER_ROLE.superAdmin &&
    user?.role !== ENUM_USER_ROLE.admin &&
    isExist?._id?.toString() !== user?.roleBaseUserId.toString() &&
    isExist.author?.userId?.toString() !== user?.userId.toString()
  ) {
    throw new ApiError(403, 'forbidden access');
  }

  const result = await UserSaveProduct.findOneAndUpdate(
    { _id: id },
    { isDelete: true },
    { new: true, runValidators: true },
  );
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Failed to delete');
  }
  return result;
};
//
const updateUserSaveProductSerialNumberFromDb = async (
  payload: { _id: string; number: number }[],
): Promise<IUserSaveProduct[] | null> => {
  const premissAll: any = [];
  for (let i = 0; i < payload.length; i++) {
    premissAll.push(
      UserSaveProduct.findByIdAndUpdate(
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

export const UserSaveProductService = {
  createUserSaveProductByDb,
  getAllUserSaveProductFromDb,
  getSingleUserSaveProductFromDb,
  updateUserSaveProductFromDb,
  deleteUserSaveProductByIdFromDb,
  //
  updateUserSaveProductSerialNumberFromDb,
};
