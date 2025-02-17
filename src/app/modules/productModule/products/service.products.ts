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
import { Product_SEARCHABLE_FIELDS } from './consent.products';
import { IProduct, IProductFilters } from './interface.products';
import { Product } from './model.products';

const createProductByDb = async (
  payload: IProduct,
  req: Request,
): Promise<IProduct> => {
  const [findIndex] = await Promise.all([
    Product.findOne({
      isDelete: false,
    }).sort({ serialNumber: -1 }),
  ]);

  payload.serialNumber = findIndex?.serialNumber
    ? findIndex?.serialNumber + 1
    : 1;

  const result = await Product.create(payload);
  return result;
};

//getAllProductFromDb
const getAllProductFromDb = async (
  filters: IProductFilters,
  paginationOptions: IPaginationOption,
  req: Request,
): Promise<IGenericResponse<IProduct[]>> => {
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

  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      $or: Product_SEARCHABLE_FIELDS.map(field => ({
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
        } else if (field === 'minPrice') {
          modifyFiled = { ['pricing.price']: { $gte: parseFloat(value) } };
        } else if (field === 'maxPrice') {
          modifyFiled = { ['pricing.price']: { $lte: parseFloat(value) } };
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
        //@ts-ignore
        createdAt: {
          $gte: new Date(createdAtFrom),
          $lte: new Date(createdAtToModify),
        },
      });
    } else if (createdAtFrom && createdAtTo) {
      condition.push({
        //@ts-ignore
        createdAt: {
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

  // const result = await Product.find(whereConditions)
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
    Product.aggregate(pipeline),
    Product.countDocuments(whereConditions),
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

// get single Producte form db
const getSingleProductFromDb = async (
  id: string,
  filters: IProductFilters,
  req: Request,
): Promise<IProduct | null> => {
  const pipeline: PipelineStage[] = [
    { $match: { _id: new Types.ObjectId(id) } },
    ///***************** */ images field ******start
  ];

  const result = await Product.aggregate(pipeline);
  if (result.length) {
    if (result[0].isDelete === true) {
      result[0] = [];
    }
  }
  return result[0];
};

// update Producte form db
const updateProductFromDb = async (
  id: string,
  payload: Partial<IProduct>,
  user: IUserRef,
  req: Request,
): Promise<IProduct | null> => {
  const isExist = (await Product.findById(id)) as IProduct & {
    _id: Schema.Types.ObjectId;
  };
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  if (
    user?.role !== ENUM_USER_ROLE.superAdmin &&
    user?.role !== ENUM_USER_ROLE.admin &&
    isExist?._id?.toString() !== user?.roleBaseUserId?.toString() &&
    isExist.author.userId.toString() !== user?.userId?.toString()
  ) {
    throw new ApiError(403, 'forbidden access');
  }
  const result = await Product.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return result;
};

// delete Producte form db
const deleteProductByIdFromDb = async (
  id: string,
  query: IProductFilters,
  user: IUserRef,
  req: Request,
): Promise<IProduct | null> => {
  const isExist = (await Product.findById(id)) as IProduct & {
    _id: Schema.Types.ObjectId;
  };
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  if (
    user?.role !== ENUM_USER_ROLE.superAdmin &&
    user?.role !== ENUM_USER_ROLE.admin &&
    isExist?._id?.toString() !== user?.roleBaseUserId.toString() &&
    isExist.author?.userId?.toString() !== user?.userId.toString()
  ) {
    throw new ApiError(403, 'forbidden access');
  }

  const result = await Product.findOneAndUpdate(
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
const updateProductSerialNumberFromDb = async (
  payload: { _id: string; number: number }[],
): Promise<IProduct[] | null> => {
  const premissAll: any = [];
  for (let i = 0; i < payload.length; i++) {
    premissAll.push(
      Product.findByIdAndUpdate(
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

export const ProductService = {
  createProductByDb,
  getAllProductFromDb,
  getSingleProductFromDb,
  updateProductFromDb,
  deleteProductByIdFromDb,
  //
  updateProductSerialNumberFromDb,
};
