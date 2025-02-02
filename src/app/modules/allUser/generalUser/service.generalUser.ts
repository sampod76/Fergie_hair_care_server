/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from 'bcrypt';
import { Request } from 'express';
import httpStatus from 'http-status';
import mongoose, { PipelineStage, Schema, Types } from 'mongoose';

import { ENUM_YN } from '../../../../global/enum_constant_type';
import { ENUM_USER_ROLE } from '../../../../global/enums/users';
import { paginationHelper } from '../../../../helper/paginationHelper';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interface/common';
import { IPaginationOption } from '../../../interface/pagination';

import { LookupReusable } from '../../../../helper/lookUpResuable';
import { ENUM_VERIFY, IUserRef } from '../typesAndConst';
import { User } from '../user/user.model';
import { GeneralUserSearchableFields } from './constant.generalUser';
import { IGeneralUser, IGeneralUserFilters } from './interface.generalUser';
import { GeneralUser } from './model.generalUser';

const createGeneralUser = async (
  data: IGeneralUser,
  req?: Request,
): Promise<IGeneralUser | null> => {
  const res = await GeneralUser.create(data);
  return res;
};

const getAllGeneralUsersFromDB = async (
  filters: IGeneralUserFilters,
  paginationOptions: IPaginationOption,
  req: Request,
): Promise<IGenericResponse<IGeneralUser[] | null>> => {
  const {
    searchTerm,
    createdAtFrom,
    createdAtTo,
    needProperty,
    ...filtersData
  } = filters;
  filtersData.isDelete = filtersData.isDelete
    ? filtersData.isDelete
    : ENUM_YN.NO;
  filtersData.verify = filtersData.verify
    ? filtersData.verify
    : ENUM_VERIFY.ACCEPT;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: GeneralUserSearchableFields.map((field: string) => ({
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
        if (field === 'countryName') {
          modifyFiled = {
            ['country.name']: new Types.ObjectId(value),
          };
        } else if (field === 'authUserId') {
          modifyFiled = {
            ['authUserId']: new Types.ObjectId(value),
          };
        } else if (field === 'dateOfBirth') {
          const timeTo = new Date(value);
          const createdAtToModify = new Date(timeTo.setHours(23, 59, 59, 999));
          modifyFiled = {
            [field]: {
              $gte: new Date(value),
              $lte: new Date(createdAtToModify),
            },
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

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);
  const sortConditions: { [key: string]: 1 | -1 } = {};
  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder === 'asc' ? 1 : -1;
  }

  //****************pagination end ***************/

  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const pipeline: PipelineStage[] = [
    { $match: whereConditions },
    { $sort: sortConditions },
    { $project: { password: 0, secret: 0 } },
    { $skip: Number(skip) || 0 },
    { $limit: Number(limit) || 10 },
  ];

  LookupReusable(pipeline, {
    collections: [
      {
        connectionName: 'users',
        idFiledName: 'userId',
        pipeLineMatchField: '_id',
        outPutFieldName: 'userDetails',
      },
    ],
  });

  // const result = await GeneralUser.aggregate(pipeline);
  // const total = await GeneralUser.countDocuments(whereConditions);
  //!-- alternatively and faster
  const pipeLineResult = await GeneralUser.aggregate([
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
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const updateGeneralUserFromDB = async (
  id: string,
  data: IGeneralUser,
  user?: IUserRef,
  req?: Request,
): Promise<IGeneralUser | null> => {
  const isExist = (await GeneralUser.findById(id)) as IGeneralUser & {
    _id: Schema.Types.ObjectId;
  };
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'GeneralUser not found');
  }
  if (
    user?.role !== ENUM_USER_ROLE.superAdmin &&
    user?.role !== ENUM_USER_ROLE.admin &&
    isExist?._id?.toString() !== user?.roleBaseUserId
  ) {
    throw new ApiError(403, 'forbidden access');
  }

  const { name, address, ...GeneralUserData } = data;
  if (
    user?.role !== ENUM_USER_ROLE.superAdmin &&
    user?.role !== ENUM_USER_ROLE.admin
  ) {
    delete (GeneralUserData as Partial<IGeneralUser>)['isDelete']; // remove it because , any user update time to not update this field , when user apply delete route to modify this field
    delete (GeneralUserData as Partial<IGeneralUser>)['email'];
    delete (GeneralUserData as Partial<IGeneralUser>)['userUniqueId'];
    delete (GeneralUserData as Partial<IGeneralUser>)['verify'];
  }
  const updatedGeneralUserData: Partial<IGeneralUser> = { ...GeneralUserData };

  if (address && Object.keys(address).length) {
    Object.keys(address).forEach(key => {
      const nameKey = `address.${key}` as keyof Partial<IGeneralUser>;
      (updatedGeneralUserData as any)[nameKey] =
        address[key as keyof typeof address];
    });
  }
  if (name && Object.keys(name).length) {
    Object.keys(name).forEach(key => {
      const nameKey = `name.${key}` as keyof Partial<IGeneralUser>;
      (updatedGeneralUserData as any)[nameKey] = name[key as keyof typeof name];
    });
  }
  const updatedGeneralUser = await GeneralUser.findOneAndUpdate(
    { _id: id },
    updatedGeneralUserData,
    {
      new: true,
      runValidators: true,
    },
  );
  if (!updatedGeneralUser) {
    throw new ApiError(400, 'Failed to update GeneralUser');
  }
  return updatedGeneralUser;
};

const getSingleGeneralUserFromDB = async (
  id: string,
  req: Request,
): Promise<IGeneralUser | null> => {
  const user = await GeneralUser.isGeneralUserExistMethod(id, {
    populate: true,
  });

  return user;
};

const deleteGeneralUserFromDB = async (
  id: string,
  query: IGeneralUserFilters,
  req: Request,
): Promise<IGeneralUser | null> => {
  // const isExist = (await GeneralUser.findById(id).select('+password')) as IGeneralUser & {
  //   _id: Schema.Types.ObjectId;
  // };
  const isExist = await GeneralUser.aggregate([
    { $match: { _id: new Types.ObjectId(id), isDelete: ENUM_YN.NO } },
  ]);

  if (!isExist.length) {
    throw new ApiError(httpStatus.NOT_FOUND, 'GeneralUser not found');
  }

  if (
    req?.user?.role !== ENUM_USER_ROLE.admin &&
    req?.user?.role !== ENUM_USER_ROLE.superAdmin &&
    isExist[0]?._id?.toString() !== req?.user?.roleBaseUserId
  ) {
    throw new ApiError(403, 'forbidden access');
  }

  //---- if user when delete you account then give his password
  if (
    req?.user?.role !== ENUM_USER_ROLE.admin &&
    req?.user?.role !== ENUM_USER_ROLE.superAdmin
  ) {
    if (
      isExist[0].password &&
      !(await bcrypt.compare(req.body?.password, isExist[0].password))
    ) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
    }
  }

  let data;

  if (
    query.delete == ENUM_YN.YES && // this is permanently delete but store trash collection
    (req?.user?.role == ENUM_USER_ROLE.admin ||
      req?.user?.role == ENUM_USER_ROLE.superAdmin)
  ) {
    data = null;
    // data = await GeneralUser.findOneAndDelete({ _id: id });
    /*  const session = await mongoose.startSession();
    try {
      session.startTransaction();
      data = await GeneralUser.findOneAndDelete({ _id: id });
      if (!data?.email) {
        throw new ApiError(400, 'Felid to delete GeneralUser');
      }
      const deleteUser = (await User.findOneAndDelete({
        email: isExist[0].email,
      })) as IUser;
      if (!deleteUser?.email) {
        throw new ApiError(400, 'Felid to delete GeneralUser');
      }
      await session.commitTransaction();
      await session.endSession();
    } catch (error: any) {
      await session.abortTransaction();
      await session.endSession();
      throw new ApiError(error?.statusCode || 400, error?.message);
    } */
  } else {
    // data = await GeneralUser.findOneAndUpdate(
    //   { _id: id },
    //   { isDelete: ENUM_YN.YES },
    //   { new: true, runValidators: true },
    // );

    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      data = await GeneralUser.findOneAndUpdate(
        { _id: id },
        { isDelete: ENUM_YN.YES },
        { new: true, runValidators: true, session },
      );
      if (!data?.email) {
        throw new ApiError(400, 'Felid to delete GeneralUser');
      }
      const deleteUser = await User.findOneAndUpdate(
        { email: isExist[0].email },
        { isDelete: ENUM_YN.YES },
        { new: true, runValidators: true, session },
      );
      if (!deleteUser?.email) {
        throw new ApiError(400, 'Felid to delete GeneralUser');
      }
      await session.commitTransaction();
      await session.endSession();
    } catch (error: any) {
      await session.abortTransaction();
      await session.endSession();
      throw new Error(error?.message);
    }
  }
  return data;
};

export const GeneralUserService = {
  createGeneralUser,
  getAllGeneralUsersFromDB,
  updateGeneralUserFromDB,
  getSingleGeneralUserFromDB,
  deleteGeneralUserFromDB,
};
