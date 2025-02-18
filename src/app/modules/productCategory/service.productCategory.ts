/* eslint-disable @typescript-eslint/no-unused-vars */
import { PipelineStage, Schema, Types } from 'mongoose';
import { paginationHelper } from '../../../helper/paginationHelper';

import { IGenericResponse } from '../../interface/common';
import { IPaginationOption } from '../../interface/pagination';

import { Request } from 'express';
import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import { ENUM_REDIS_KEY } from '../../redis/consent.redis';
import {
  RedisAllQueryServiceOop,
  RedisAllSetterServiceOop,
} from '../../redis/service.redis';
import { productCategory_SEARCHABLE_FIELDS } from './constant.productCategory';
import {
  IProductCategory,
  IProductCategoryFilters,
} from './interface.productCategory';
import { ProductCategory } from './model.productCategory';

const createProductCategoryByDb = async (
  payload: IProductCategory,
  req: Request,
): Promise<IProductCategory> => {
  const [findAlreadyExists, findIndex] = await Promise.all([
    ProductCategory.findOne({
      title: { $regex: new RegExp(`^${payload.title}$`, 'i') },

      isDelete: false,
    }),
    ProductCategory.findOne({
      isDelete: false,
    }).sort({ serialNumber: -1 }),
  ]);

  if (findAlreadyExists) {
    throw new ApiError(400, 'This ProductCategory already Exist');
  }
  payload.serialNumber = findIndex?.serialNumber
    ? findIndex?.serialNumber + 1
    : 1;

  const result = await ProductCategory.create(payload);
  return result;
};

//getAllProductCategoryFromDb
const getAllProductCategoryFromDb = async (
  filters: IProductCategoryFilters,
  paginationOptions: IPaginationOption,
  req: Request,
): Promise<IGenericResponse<IProductCategory[]>> => {
  //****************search and filters start************/
  const { searchTerm, createdAtFrom, createdAtTo, ...filtersData } = filters;

  filtersData.isDelete = filtersData.isDelete
    ? filtersData.isDelete == 'true'
      ? true
      : false
    : false;
  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      $or: productCategory_SEARCHABLE_FIELDS.map(field => ({
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

        if (field === 'author.userId') {
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

  // const result = await ProductCategory.find(whereConditions)
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

  //***********cache start************* */
  const redisOop = new RedisAllQueryServiceOop();
  const redisClient = redisOop.getGlobalRedis();
  const getRedis = await redisClient.get(
    ENUM_REDIS_KEY.RIS_All_ProductsCategories,
  );
  if (getRedis) {
    const redisData = JSON.parse(getRedis);
    return {
      meta: {
        page: 1,
        limit: 99999,
        total: redisData.length,
      },
      data: redisData,
    };
  }
  //***********cache end************* */
  //!-- alternatively and faster
  const pipeLineResult = await ProductCategory.aggregate([
    {
      $facet: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        data: pipeline,
        countDocuments: [
          {
            $match: whereConditions,
          },
          { $count: 'totalData' },
        ],
      },
    },
  ]);
  // Extract and format the pipeLineResults
  const total = pipeLineResult[0]?.countDocuments[0]?.totalData || 0; // Extract total count
  const result = pipeLineResult[0]?.data || []; // Extract data

  const redisSetterOop = new RedisAllSetterServiceOop();
  const red = await redisSetterOop.redisSetter([
    {
      key: ENUM_REDIS_KEY.RIS_All_ProductsCategories,
      value: result,
      ttl: 1 * 60 * 60,
    },
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

// get single ProductCategorye form db
const getSingleProductCategoryFromDb = async (
  id: string,
  filters: IProductCategoryFilters,
  req: Request,
): Promise<IProductCategory | null> => {
  const pipeline: PipelineStage[] = [
    { $match: { _id: new Types.ObjectId(id) } },
    ///***************** */ images field ******start
  ];

  const result = await ProductCategory.aggregate(pipeline);
  if (result.length) {
    if (result[0].isDelete === true) {
      result[0] = [];
    }
  }
  return result[0];
};

// update ProductCategorye form db
const updateProductCategoryFromDb = async (
  id: string,
  payload: Partial<IProductCategory>,
  req: Request,
): Promise<IProductCategory | null> => {
  if (payload.serialNumber) {
    const updateAnotherSerialNumber = await ProductCategory.updateMany(
      {
        serialNumber: { $gte: payload.serialNumber },
      },
      {
        $inc: { serialNumber: 1 },
      },
    );
  }
  const result = await ProductCategory.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return result;
};

// delete ProductCategorye form db
const deleteProductCategoryByIdFromDb = async (
  id: string,
  query: IProductCategoryFilters,
  req: Request,
): Promise<IProductCategory | null> => {
  const isExist = (await ProductCategory.findById(id)) as IProductCategory & {
    _id: Schema.Types.ObjectId;
  };
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ProductCategory not found');
  }

  const result = await ProductCategory.findOneAndUpdate(
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
const updateProductCategorySerialNumberFromDb = async (
  payload: { _id: string; number: number }[],
): Promise<IProductCategory[] | null> => {
  const premissAll: any = [];
  for (let i = 0; i < payload.length; i++) {
    premissAll.push(
      ProductCategory.findByIdAndUpdate(
        payload[i]._id,
        { serialNumber: payload[i].number },
        { new: true, runValidators: true },
      ),
    );
  }
  const result = await Promise.all(premissAll);
  return result;
};

export const ProductCategoryService = {
  createProductCategoryByDb,
  getAllProductCategoryFromDb,
  getSingleProductCategoryFromDb,
  updateProductCategoryFromDb,
  deleteProductCategoryByIdFromDb,
  //
  updateProductCategorySerialNumberFromDb,
};
