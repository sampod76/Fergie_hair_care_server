/* eslint-disable @typescript-eslint/no-unused-vars */
import { PipelineStage, Schema, Types } from 'mongoose';
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
import { UuidUtls } from '../../../utils/uuidGenerator';
import ApiError from '../../errors/ApiError';
import { IUserRef } from '../allUser/typesAndConst';
import { ServiceLogger_SEARCHABLE_FIELDS } from './constant.serviceLogger';
import {
  IServiceLogger,
  IServiceLoggerFilters,
} from './interface.serviceLogger';
import { ServiceLogger } from './model.serviceLogger';

const createServiceLoggerByDb = async (
  payload: IServiceLogger,
  req: Request,
): Promise<IServiceLogger | null> => {
  const user = req.user as IUserRef;

  const result = await ServiceLogger.create(payload);
  return result;
};

//getAllServiceLoggerFromDb
const getAllServiceLoggerFromDb = async (
  filters: IServiceLoggerFilters,
  paginationOptions: IPaginationOption,
  req: Request,
): Promise<IGenericResponse<IServiceLogger[]>> => {
  const user = req?.user as IUserRef;
  //****************search and filters start************/
  const {
    searchTerm,
    createdAtFrom,
    createdAtTo,
    logDateFrom,
    logDateTo,
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
      $or: ServiceLogger_SEARCHABLE_FIELDS.map(field => ({
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
        if (field === 'author.userId' || field === 'author.roleBaseUserId') {
          modifyFiled = {
            [field]: new Types.ObjectId(value),
          };
        } else if (
          field === 'Wash_Day_Mood' ||
          field === 'Choice_of_Treatment' ||
          field === 'Post_Wash_Day_Style' ||
          field === 'Hair_Health' ||
          field === 'What_Style_Did_You_Do' ||
          field === 'Style_Rating' ||
          field === 'Hair_Service_Quality' ||
          field === 'Duration_of_style_wear' ||
          field === 'Maintenance_Routine' ||
          field === 'Haircut_Type' ||
          field === 'Length_Cut'
        ) {
          const uuid = new UuidUtls(value);
          if (uuid.isUuidValid()) {
            modifyFiled = { [`${field}.uid`]: value };
          } else {
            modifyFiled = {
              [`${field}.value`]: { $regex: value, $options: 'i' },
            };
          }
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
    //
    if (logDateFrom && !logDateTo) {
      const timeTo = new Date(logDateFrom);
      const logDateToModify = new Date(timeTo.setHours(23, 59, 59, 999));
      condition.push({
        //@ts-ignore
        logDate: {
          //@ts-ignore
          $gte: new Date(logDateFrom),
          $lte: new Date(logDateToModify),
        },
      });
    } else if (logDateFrom && logDateTo) {
      condition.push({
        //@ts-ignore
        logDate: {
          //@ts-ignore
          $gte: new Date(logDateFrom),
          $lte: new Date(logDateTo),
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

  // const result = await ServiceLogger.find(whereConditions)
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

  // const result = await ServiceLogger.aggregate(pipeline);
  // const total = await ServiceLogger.countDocuments(whereConditions);
  const [result, total] = await Promise.all([
    ServiceLogger.aggregate(pipeline),
    ServiceLogger.countDocuments(whereConditions),
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

// get single ServiceLoggere form db
const getSingleServiceLoggerFromDb = async (
  id: string,
  filters: IServiceLoggerFilters,
  req: Request,
): Promise<IServiceLogger | null> => {
  const user = req.user as IUserRef;
  const pipeline: PipelineStage[] = [
    { $match: { _id: new Types.ObjectId(id), isDelete: false } },
    ///***************** */ images field ******start
  ];
  const result = await ServiceLogger.aggregate(pipeline);
  const dataReturn = result.length ? result[0] : null;
  if (!dataReturn) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ServiceLogger not found');
  }
  if (
    dataReturn.author.userId.toString() !== user.userId.toString() &&
    user.role !== ENUM_USER_ROLE.admin
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to delete');
  }
  return dataReturn;
};

// update ServiceLoggere form db
const updateServiceLoggerFromDb = async (
  id: string,
  payload: Partial<IServiceLogger>,
  req: Request,
): Promise<IServiceLogger | null> => {
  const user = req.user as IUserRef;
  const isExist = (await ServiceLogger.findById(id)) as IServiceLogger & {
    _id: Schema.Types.ObjectId;
  };
  if (!isExist || !isExist.isDelete) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ServiceLogger not found');
  }
  if (
    isExist.author.userId.toString() !== user.userId.toString() &&
    user.role !== ENUM_USER_ROLE.admin
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to delete');
  }
  const result = await ServiceLogger.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return result;
};

// delete ServiceLoggere form db
const deleteServiceLoggerByIdFromDb = async (
  id: string,
  query: IServiceLoggerFilters,
  req: Request,
): Promise<IServiceLogger | null> => {
  const user = req.user as IUserRef;
  const isExist = (await ServiceLogger.findById(id)) as IServiceLogger & {
    _id: Schema.Types.ObjectId;
  };
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ServiceLogger not found');
  }
  if (
    isExist.author.userId.toString() !== user.userId.toString() &&
    user.role !== ENUM_USER_ROLE.admin
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to delete');
  }

  const result = await ServiceLogger.findOneAndUpdate(
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
const updateServiceLoggerSerialNumberFromDb = async (
  payload: { _id: string; number: number }[],
): Promise<IServiceLogger[] | null> => {
  const premissAll: any = [];
  for (let i = 0; i < payload.length; i++) {
    premissAll.push(
      ServiceLogger.findByIdAndUpdate(
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

export const ServiceLoggerService = {
  createServiceLoggerByDb,
  getAllServiceLoggerFromDb,
  getSingleServiceLoggerFromDb,
  updateServiceLoggerFromDb,
  deleteServiceLoggerByIdFromDb,
  //
  updateServiceLoggerSerialNumberFromDb,
};
