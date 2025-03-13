/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from 'express';
import httpStatus from 'http-status';
import { PipelineStage, Schema, Types } from 'mongoose';

import { ENUM_YN } from '../../../../global/enum_constant_type';
import { ENUM_USER_ROLE } from '../../../../global/enums/users';
import {
  ILookupCollection,
  LookupAnyRoleDetailsReusable,
  LookupReusable,
} from '../../../../helper/lookUpResuable';
import { paginationHelper } from '../../../../helper/paginationHelper';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interface/common';
import { IPaginationOption } from '../../../interface/pagination';
import { IUserRef, IUserRefAndDetails } from '../../allUser/typesAndConst';
import { IProduct } from '../../productModule/products/interface.products';
import { ENUM_ORDER_STATUS, OrderSearchableFields } from './constants.order';
import { IOrder, IOrderFilters } from './interface.order';
import { Order } from './models.order';

const createOrderFromDb = async (
  data: IOrder,
  user?: IUserRefAndDetails,
): Promise<IOrder | null> => {
  const res = await Order.create(data);
  return res;
};

const getAllOrdersFromDB = async (
  filters: IOrderFilters,
  paginationOptions: IPaginationOption,
  user?: IUserRef,
  req?: Request,
): Promise<IGenericResponse<IOrder[] | null>> => {
  const {
    searchTerm,
    createdAtFrom,
    createdAtTo,
    needProperty,
    ...filtersData
  } = filters;
  filtersData.isDelete = filtersData.isDelete
    ? filtersData.isDelete == 'true'
      ? true
      : false
    : false;

  if (user?.role !== ENUM_USER_ROLE.admin) {
    filtersData['author.userId'] = user?.userId.toString();
  }

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: OrderSearchableFields.map((field: string) => ({
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
          field === 'packageId' ||
          field === 'paymentId' ||
          field === 'author.userId' ||
          field === 'author.roleBaseUserId'
        ) {
          modifyFiled = {
            [field]: new Types.ObjectId(value),
          };
        }

        //  else if (field === 'from') {
        //   modifyFiled = {
        //     ['from']: { $gte: new Date(value) },
        //   };
        // } else if (field === 'to') {
        //   modifyFiled = {
        //     ['to']: { $lte: new Date(value) },
        //   };
        // }
        else {
          modifyFiled = { [field]: value };
        }

        return modifyFiled;
      },
    );
    //
    if (createdAtFrom && !createdAtTo) {
      //only single data in register all data -> 2022-02-25_12:00_am to 2022-02-25_11:59 pm minutes
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
  //********************end of filter conditions**************

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
    { $skip: Number(skip) || 0 },
    { $limit: Number(limit) || 10 },
  ];
  //!------------check -access validation ------------------
  const check = await Order.findOne(whereConditions);
  if (check) {
    if (
      check.author.userId.toString() !== req?.user?.userId.toString() &&
      req?.user?.role !== ENUM_USER_ROLE.admin &&
      req?.user?.role !== ENUM_USER_ROLE.superAdmin
    ) {
      throw new ApiError(httpStatus.FORBIDDEN, 'forbidden access data');
    }
  }
  //!------------check -access validation ------------------
  //!-----------------------start --lookup-----------------
  // Define the collections array with the correct type
  const collections: ILookupCollection<any>[] = []; // Use the correct type here
  if (needProperty && needProperty.includes('paymentId')) {
    const pipelineConnection: ILookupCollection<any> = {
      connectionName: 'paymenthistories',
      idFiledName: 'paymentId',
      pipeLineMatchField: '_id',
      outPutFieldName: 'paymentDetails',
    };
    collections.push(pipelineConnection);
  }
  if (needProperty && needProperty.includes('productId')) {
    const pipelineConnection: ILookupCollection<IProduct> = {
      connectionName: 'products',
      idFiledName: '$productId',
      pipeLineMatchField: '$_id',
      outPutFieldName: 'productDetails',
      project: { name: 1, images: 1, pricing: 1 },
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

  const [result, total] = await Promise.all([
    Order.aggregate(pipeline),
    Order.countDocuments(whereConditions),
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
const getSingleOrderFromDB = async (
  id: string,
  user?: IUserRef,
  req?: Request,
): Promise<IOrder | null> => {
  const needProperty = req?.query?.needProperty as string;
  const data = await Order.isOrderExistMethod(id, {
    populate: true,
    needProperty: needProperty?.split(',').map(property => property.trim()),
  });

  return data;
};
const getDashboardStatusFromDB = async (
  id: string,
  user: IUserRef,
  req?: Request,
): Promise<IOrder[] | null> => {
  const query = {
    isDelete: false,
  } as any;
  if (
    user?.role !== ENUM_USER_ROLE.admin &&
    user?.role !== ENUM_USER_ROLE.superAdmin
  ) {
    query[`author.userId`] = new Types.ObjectId(user?.userId);
  } else {
    if (req?.query?.authorUserId) {
      query['author.userId'] = new Types.ObjectId(
        req?.query?.authorUserId as string,
      );
    }
  }
  const data = await Order.aggregate([
    {
      $match: query,
    },
    {
      $group: {
        _id: null,
        totalOrder: { $sum: 1 },

        completedOrderBalance: {
          $sum: '$price',
        },
      },
    },
  ]);

  return data;
};

const updateOrderFromDB = async (
  id: string,
  data: IOrder,
  user: IUserRef,
  req?: Request,
): Promise<IOrder | null> => {
  const isExist = (await Order.findById(id)) as IOrder & {
    _id: Schema.Types.ObjectId;
  } as IOrder;
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  if (
    user?.role !== ENUM_USER_ROLE.superAdmin &&
    user?.role !== ENUM_USER_ROLE.admin &&
    isExist?.author?.userId?.toString() !== user?.userId.toString()
  ) {
    throw new ApiError(403, 'forbidden access');
  }

  const { ...OrderData } = data;
  if (
    user?.role !== ENUM_USER_ROLE.superAdmin &&
    user?.role !== ENUM_USER_ROLE.admin
  ) {
    delete (OrderData as Partial<IOrder>)['isDelete']; // remove it because , any user update time to not update this field , when user apply delete route to modify this field
  }
  const updatedOrderData: Partial<IOrder> = { ...OrderData };

  const updatedOrder = await Order.findOneAndUpdate(
    { _id: id },
    updatedOrderData,
    {
      new: true,
      runValidators: true,
    },
  );
  if (!updatedOrder) {
    throw new ApiError(400, 'Failed to update Order');
  }
  return updatedOrder;
};

const orderCompleteFromDB = async (
  id: string,
  data: IOrder,
  user: IUserRef,
  req?: Request,
): Promise<IOrder | null> => {
  const isExist = await Order.isOrderExistMethod(id, {});
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  //when any person send order request then completed another person
  if (
    isExist.author.userId.toString() !== user?.userId.toString() &&
    user.role !== ENUM_USER_ROLE.admin &&
    user.role !== ENUM_USER_ROLE.superAdmin
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'forbidden access');
  }
  if (
    isExist.orderStatus === ENUM_ORDER_STATUS.reject ||
    isExist.orderStatus === ENUM_ORDER_STATUS.pending
  ) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      `Order cannot be completed as it is already ${isExist.orderStatus}`,
    );
  }

  if (isExist.orderStatus !== ENUM_ORDER_STATUS.accept) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      'Order cannot be reject as it is not in a pending state',
    );
  }

  const updatedOrder = await Order.findOneAndUpdate(
    { _id: id },
    { orderStatus: ENUM_ORDER_STATUS.completed },
    {
      new: true,
      runValidators: true,
    },
  );
  //!bullmq --> send seller payment request
  if (!updatedOrder) {
    throw new ApiError(400, 'Failed to update Order');
  }
  return updatedOrder;
};

const deleteOrderFromDB = async (
  id: string,
  query: IOrderFilters,
  user: IUserRef,
  req: Request,
): Promise<IOrder | null> => {
  // const isExist = (await Order.findById(id).select('+password')) as IOrder & {
  //   _id: Schema.Types.ObjectId;
  // };
  const isExist = (await Order.aggregate([
    { $match: { _id: new Types.ObjectId(id), isDelete: false } },
  ])) as IOrder[];

  if (!isExist.length) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  if (
    user?.role !== ENUM_USER_ROLE.admin &&
    user?.role !== ENUM_USER_ROLE.superAdmin
    // && isExist[0]?.seller?.userId?.toString() !== user?.userId
  ) {
    throw new ApiError(403, 'forbidden access');
  }

  let data;

  if (
    query.delete == ENUM_YN.YES && // this is permanently delete but store trash collection
    (user?.role == ENUM_USER_ROLE.admin ||
      user?.role == ENUM_USER_ROLE.superAdmin)
  ) {
    // data = await Order.findOneAndDelete({ _id: id });
    data = null;
  } else {
    data = await Order.findOneAndUpdate(
      { _id: id },
      { isDelete: ENUM_YN.YES },
      { new: true, runValidators: true },
    );
  }
  return data;
};

export const OrderService = {
  createOrderFromDb,
  getAllOrdersFromDB,
  updateOrderFromDB,
  getSingleOrderFromDB,
  deleteOrderFromDB,
  //
  getDashboardStatusFromDB,
  //
  orderCompleteFromDB,
};
