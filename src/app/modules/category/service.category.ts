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
import { CATEGORY_SEARCHABLE_FIELDS } from './constant.category';
import { ICategory, ICategoryFilters } from './interface.category';
import { Category } from './model.category';

const createCategoryByDb = async (
  payload: ICategory,
  req: Request,
): Promise<ICategory> => {
  const [findAlreadyExists, findIndex] = await Promise.all([
    Category.findOne({
      value: { $regex: new RegExp(`^${payload.value}$`, 'i') },
      categoryType: payload.categoryType,
      isDelete: false,
    }),
    Category.findOne({
      categoryType: payload.categoryType,
      isDelete: false,
    }).sort({ serialNumber: -1 }),
  ]);

  if (findAlreadyExists) {
    throw new ApiError(400, 'This Category already Exist');
  }
  payload.serialNumber = findIndex?.serialNumber
    ? findIndex?.serialNumber + 1
    : 1;

  const result = await Category.create(payload);
  return result;
};

//getAllCategoryFromDb
const getAllCategoryFromDb = async (
  filters: ICategoryFilters,
  paginationOptions: IPaginationOption,
  req: Request,
): Promise<IGenericResponse<ICategory[]>> => {
  //****************search and filters start************/
  const {
    searchTerm,
    createdAtFrom,
    createdAtTo,
    needProperty,
    ...filtersData
  } = filters;
  //***********cache start************* */
  const redisOop = new RedisAllQueryServiceOop();
  const redisClient = redisOop.getGlobalRedis();
  const getRedis = await redisClient.get(
    filters.categoryType
      ? ENUM_REDIS_KEY.RIS_All_Categories + ':' + filters.categoryType
      : ENUM_REDIS_KEY.RIS_All_Categories,
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

  filtersData.isDelete = filtersData.isDelete
    ? filtersData.isDelete == 'true'
      ? true
      : false
    : false;
  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      $or: CATEGORY_SEARCHABLE_FIELDS.map(field => ({
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
        if (field === 'authorUserId') {
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

  // const result = await Category.find(whereConditions)
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

  // const result = await Category.aggregate(pipeline);
  // const total = await Category.countDocuments(whereConditions);

  //!-- alternatively and faster
  const pipeLineResult = await Category.aggregate([
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
      key: filters.categoryType
        ? ENUM_REDIS_KEY.RIS_All_Categories + ':' + filters.categoryType
        : ENUM_REDIS_KEY.RIS_All_Categories,
      value: result,
      ttl: 1 * 60 * 60,
    },
  ]);
  // console.log('🚀 ~ red:', red);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// get single Categorye form db
const getSingleCategoryFromDb = async (
  id: string,
  filters: ICategoryFilters,
  req: Request,
): Promise<ICategory | null> => {
  const pipeline: PipelineStage[] = [
    { $match: { _id: new Types.ObjectId(id), isDelete: false } },
    ///***************** */ images field ******start
  ];
  const result = await Category.aggregate(pipeline);
  return result.length ? result[0] : null;
};

// update Categorye form db
const updateCategoryFromDb = async (
  id: string,
  payload: Partial<ICategory>,
  req: Request,
): Promise<ICategory | null> => {
  const result = await Category.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return result;
};

// delete Categorye form db
const deleteCategoryByIdFromDb = async (
  id: string,
  query: ICategoryFilters,
  req: Request,
): Promise<ICategory | null> => {
  const isExist = (await Category.findById(id)) as ICategory & {
    _id: Schema.Types.ObjectId;
  };
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  const result = await Category.findOneAndUpdate(
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
const updateCategorySerialNumberFromDb = async (
  payload: { _id: string; number: number }[],
): Promise<ICategory[] | null> => {
  const premissAll: any = [];
  for (let i = 0; i < payload.length; i++) {
    premissAll.push(
      Category.findByIdAndUpdate(
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

export const CategoryService = {
  createCategoryByDb,
  getAllCategoryFromDb,
  getSingleCategoryFromDb,
  updateCategoryFromDb,
  deleteCategoryByIdFromDb,
  //
  updateCategorySerialNumberFromDb,
};
