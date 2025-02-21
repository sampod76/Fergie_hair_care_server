import { Types } from 'mongoose';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request } from 'express';
import mongoose, { PipelineStage } from 'mongoose';
import { ENUM_YN } from '../../../../global/enum_constant_type';
import { paginationHelper } from '../../../../helper/paginationHelper';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interface/common';
import { IPaginationOption } from '../../../interface/pagination';
// import { paymentQueue } from '../../../queue/jobs/paymentQueues';
import httpStatus from 'http-status';
import { LookupAnyRoleDetailsReusable } from '../../../../helper/lookUpResuable';
import { IUserRef } from '../../allUser/typesAndConst';
import { ENUM_ORDER_STATUS } from '../order/constants.order';
import { Order } from '../order/models.order';
import { IStripeProductMetaData } from '../payment/payment.service';
import {
  IPaymentIntentAndSessionResponse,
  refundFunc,
  stripeSessionIdCsId_To_PaymentIntent,
} from '../payment/payment.utls';
import { PAYMENT_HISTORY_SEARCHABLE_FIELDS } from './consent.paymentHistory';
import {
  IPaymentHistory,
  IPaymentHistoryFilters,
} from './interface.paymentHistory';
import { PaymentHistory } from './model.paymentHistory';

const createPaymentHistoryByDb = async (
  payload: { cs_id: string; metadata?: string },
  req?: Request,
): Promise<{
  result: IPaymentHistory | null | undefined;
  sessionDetails: IPaymentIntentAndSessionResponse;
}> => {
  const promises = [
    stripeSessionIdCsId_To_PaymentIntent({
      cs_id: payload.cs_id, // as sessionId
    }),
    PaymentHistory.findOne({
      cs_id: payload.cs_id,
    }),
  ];
  const resolvePromises = await Promise.all(promises);
  const balanceTransaction =
    resolvePromises[0] as IPaymentIntentAndSessionResponse;
  // console.log(JSON.stringify(balanceTransaction));
  const findTransaction = resolvePromises[1];
  if (findTransaction) {
    // my database
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Transaction already used');
  }
  // logger.info(balanceTransaction);
  if (!balanceTransaction?.paymentIntentResponse) {
    throw new ApiError(400, 'Transaction not available');
  } else if (
    balanceTransaction?.sessionsResponse &&
    balanceTransaction?.paymentIntentResponse?.status !== 'succeeded'
  ) {
    throw new ApiError(400, `Transaction not succeeded `);
  } else if (!balanceTransaction?.paymentIntentResponse?.latest_charge) {
    throw new ApiError(400, 'Transaction not succeeded');
  }
  const { paymentIntentResponse, sessionsResponse } = balanceTransaction;
  // hard security by stripe, when successful use stripe then set stripe metadata alreadyUsed
  if (paymentIntentResponse?.metadata?.alreadyUsed === 'yes') {
    //stripe data
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Transaction already used');
  }

  const author = {
    role: paymentIntentResponse?.metadata?.role,
    userId: paymentIntentResponse?.metadata?.userId,
    roleBaseUserId: paymentIntentResponse?.metadata?.roleBaseUserId,
  } as IUserRef;

  const data: IPaymentHistory = {
    ...paymentIntentResponse,
    cs_id: sessionsResponse?.id as string,
    pi_id: paymentIntentResponse.id,
    ch_id: paymentIntentResponse.latest_charge as string,
    author: author,
    amount: paymentIntentResponse.amount / 100,
    amount_received: paymentIntentResponse.amount_received / 100,
    paymentBy: 'stripe',
    ...paymentIntentResponse.metadata, // automatically set all metadata in values
  };
  const products = JSON.parse(
    paymentIntentResponse.metadata.products,
  ) as IStripeProductMetaData[];
  data['productIds'] = products.map(p => p.productId);

  const session = await mongoose.startSession();
  session.startTransaction();
  let result: IPaymentHistory[];
  try {
    // Create Payment History within the transaction
    result = await PaymentHistory.create([data], { session });

    const orderData = products.map(product => {
      return {
        author: author,
        cs_id: data.cs_id,
        pi_id: data.pi_id,
        productId: product.productId,
        paymentId: result[0]._id,
        quantity: product.quantity,
        orderStatus: ENUM_ORDER_STATUS.completed,
        paymentBy: 'stripe',
        totalPrice: product.quantity * product.price,
      };
    });

    const cre = await Order.create(orderData, { session });

    console.log('🚀 ~ cre:', cre);
    // Commit the transaction if all operations are successful
    await session.commitTransaction();
    session.endSession();
  } catch (error: any) {
    // Abort the transaction on error
    await session.abortTransaction();
    session.endSession();
    await refundFunc({
      orderId: paymentIntentResponse.metadata?.orderId,
      ch_id: paymentIntentResponse.latest_charge as string,
      usersAndMessage: [
        {
          user: paymentIntentResponse?.metadata?.userId as string,
          subject: '',
          message: '',
        },
      ],
    });
    throw new Error(error?.message); // Rethrow the error after aborting the transaction
  }

  return { result: result[0], sessionDetails: balanceTransaction };
};

//getAllPaymentHistoryFromDb//getAllPaymentHistoryFromDb
const getAllPaymentHistoryFromDb = async (
  filters: IPaymentHistoryFilters,
  paginationOptions: IPaginationOption,
  req?: Request,
): Promise<IGenericResponse<IPaymentHistory[]>> => {
  //****************search and filters start************/
  const {
    searchTerm,
    time,
    dateRangeFirst,
    dateRangeSecond,
    totalIncome,
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
  filtersData.isRefund = filtersData.isRefund
    ? filtersData.isRefund
    : ENUM_YN.NO;
  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: PAYMENT_HISTORY_SEARCHABLE_FIELDS.map(field => ({
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
          field === 'productId'
        ) {
          modifyFiled = {
            [field]: new Types.ObjectId(value),
          };
        } else {
          modifyFiled = { [field]: value };
        }
        return modifyFiled;
      },
    );

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

    if (time) {
      if (time === 'monthly') {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
        );
        condition.push({
          //@ts-ignore
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        });
      } else if (time === 'weekly') {
        const today = new Date();
        const startOfWeek = new Date(
          today.setDate(today.getDate() - today.getDay()),
        );
        const endOfWeek = new Date(today.setDate(startOfWeek.getDate() + 6));
        condition.push({
          //@ts-ignore
          createdAt: { $gte: startOfWeek, $lte: endOfWeek },
        });
      } else if (time === 'daily') {
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));
        condition.push({
          //@ts-ignore
          createdAt: { $gte: startOfToday, $lte: endOfToday },
        });
      }
    }
    //
    andConditions.push({
      $and: condition,
    });
  }
  // console.log(andConditions)
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

  // const result = await PaymentHistory.find(whereConditions)
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

  // LookupReusable(pipeline, {
  //   collections: [
  //     {
  //       connectionName: 'vendors',
  //       idFiledName: '$author.roleBaseUserId',
  //       pipeLineMatchField: '$_id',
  //       outPutFieldName: 'details',
  //       margeInField: 'author',
  //     },
  //   ],
  // });

  LookupAnyRoleDetailsReusable(pipeline, {
    collections: [
      {
        roleMatchFiledName: 'author.role',
        idFiledName: 'author.roleBaseUserId',
        pipeLineMatchField: '_id',
        outPutFieldName: 'details',
        margeInField: 'author',
      },
    ],
  });

  const [result, total] = await Promise.all([
    PaymentHistory.aggregate(pipeline),
    PaymentHistory.countDocuments(whereConditions),
  ]);
  //!-- alternatively and faster
  // const pipeLineResult = await PaymentHistory.aggregate([
  //   {
  //     $facet: {
  //       //@ts-ignore
  //       data: pipeline,
  //       countDocuments: [
  //         {
  //           $match: whereConditions,
  //         },
  //         { $count: 'totalData' },
  //       ],
  //     },
  //   },
  // ]);
  // // Extract and format the pipeLineResults
  // const total = pipeLineResult[0]?.countDocuments[0]?.totalData || 0; // Extract total count
  // const result = pipeLineResult[0]?.data || []; // Extract data

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};
//getAllTimeToGroupPaymentHistory//getAllTimeToGroupPaymentHistory
const getAllTimeToGroupPaymentHistoryFromDb = async (
  filters: IPaymentHistoryFilters,
  paginationOptions: IPaginationOption,
  req?: Request,
): Promise<IGenericResponse<IPaymentHistory[]>> => {
  //****************search and filters start************/
  const {
    searchTerm,
    dateRangeFirst,
    dateRangeSecond,
    time,
    createdAtFrom,
    createdAtTo,
    ...filtersData
  } = filters;
  filtersData.isDelete = filtersData.isDelete
    ? filtersData.isDelete == 'true'
      ? true
      : false
    : false;
  filtersData.isRefund = filtersData.isRefund
    ? filtersData.isRefund
    : ENUM_YN.NO;
  const andConditions = [];
  const removeTimeAndCondition = [];
  if (searchTerm) {
    andConditions.push({
      $or: PAYMENT_HISTORY_SEARCHABLE_FIELDS.map(field => ({
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
          field === 'productId'
        ) {
          modifyFiled = {
            [field]: new Types.ObjectId(value),
          };
        } else {
          modifyFiled = { [field]: value };
        }
        return modifyFiled;
      },
    );

    removeTimeAndCondition.push({
      $and: [...condition],
    });
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
    if (time) {
      if (time === 'monthly') {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
        );
        condition.push({
          //@ts-ignore
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        });
      } else if (time === 'weekly') {
        const today = new Date();
        const startOfWeek = new Date(
          today.setDate(today.getDate() - today.getDay()),
        );
        const endOfWeek = new Date(today.setDate(startOfWeek.getDate() + 6));
        condition.push({
          //@ts-ignore
          createdAt: { $gte: startOfWeek, $lte: endOfWeek },
        });
      } else if (time === 'daily') {
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));
        condition.push({
          //@ts-ignore
          createdAt: { $gte: startOfToday, $lte: endOfToday },
        });
      }
    }
    //
    andConditions.push({
      $and: condition,
    });
  }

  // console.log(andConditions)
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
  const removeTimeWhereConditions =
    removeTimeAndCondition.length > 0 ? { $and: removeTimeAndCondition } : {};

  //!-- alternatively and faster
  const pipeLineResult = await PaymentHistory.aggregate([
    {
      $facet: {
        timeToTotalIncome: [
          { $match: whereConditions },
          {
            $group: {
              _id: null,
              income: { $sum: '$amount' },
              // allData: { $push: '$$ROOT' },
            },
          },
          {
            $project: {
              _id: 0, // Optional: Exclude the _id field from the result
              income: { $round: ['$income', 2] }, // Round to 2 decimal places
            },
          },
        ],
        totalIncome: [
          {
            $match: removeTimeWhereConditions,
          },
          {
            $group: {
              _id: null,
              income: { $sum: '$amount' },
              // allData: { $push: '$$ROOT' },
            },
          },
          {
            $project: {
              _id: 0, // Optional: Exclude the _id field from the result
              income: { $round: ['$income', 2] }, // Round to 2 decimal places
            },
          },
        ],
      },
    },
  ]);
  // Extract and format the pipeLineResults
  const total = 0; // Extract total count
  const result = pipeLineResult[0] || {}; // Extract data

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};
const getAllTransactionFromDb = async (
  filters: IPaymentHistoryFilters,
  paginationOptions: IPaginationOption,
  req?: Request,
): Promise<IGenericResponse<IPaymentHistory[] | any>> => {
  //****************search and filters start************/
  const {
    searchTerm,
    needProperty,
    createdAtFrom,
    createdAtTo,
    dateRangeFirst,
    dateRangeSecond,
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
      $or: PAYMENT_HISTORY_SEARCHABLE_FIELDS.map(field => ({
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
          field === 'productId'
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
        // console.log(modifyFiled);
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
  // console.log(andConditions)
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

  const pipeline: PipelineStage[] = [
    { $match: whereConditions },
    { $sort: sortConditions },
    { $skip: Number(skip) || 0 },
    { $limit: Number(limit) || 10 },
  ];
  LookupAnyRoleDetailsReusable(pipeline, {
    collections: [
      {
        roleMatchFiledName: 'author.role',
        idFiledName: 'author.roleBaseUserId', //$sender.roleBaseUserId
        pipeLineMatchField: '_id', //$_id
        outPutFieldName: 'details',
        margeInField: 'author',
        project: { name: 1, country: 1, profileImage: 1, email: 1 },
      },
    ],
  });

  // const result = await PaymentHistory.aggregate(pipeline);
  // const total = await PaymentHistory.countDocuments(whereConditions);
  const [result, total] = await Promise.all([
    PaymentHistory.aggregate(pipeline),
    PaymentHistory.countDocuments(whereConditions),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
    // data: pipeLineResult,
  };
};
//get chart
const getAllChartOfValueFromDb = async (
  filters: IPaymentHistoryFilters,
  paginationOptions: IPaginationOption,
  req?: Request,
): Promise<IGenericResponse<IPaymentHistory[] | any>> => {
  //****************search and filters start************/
  const {
    searchTerm,
    dateRangeFirst,
    dateRangeSecond,
    yearToQuery = new Date().getFullYear(),
    ...filtersData
  } = filters;
  filtersData.isDelete = filtersData.isDelete
    ? filtersData.isDelete == 'true'
      ? true
      : false
    : false;
  filtersData.isRefund = filtersData.isRefund
    ? filtersData.isRefund == 'true'
      ? true
      : false
    : false;
  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      $or: PAYMENT_HISTORY_SEARCHABLE_FIELDS.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }
  // console.log(filtersData);
  if (Object.keys(filtersData).length) {
    const condition = Object.entries(filtersData).map(
      //@ts-ignore
      ([field, value]: [keyof typeof filtersData, string]) => {
        let modifyFiled;
        if (
          field === 'author.userId' ||
          field === 'author.roleBaseUserId' ||
          field === 'productId'
        ) {
          modifyFiled = {
            [field]: new Types.ObjectId(value),
          };
        } else if (field === 'isRefund') {
          modifyFiled = {
            ['refund.isRefund']: value,
          };
        } else {
          modifyFiled = { [field]: value };
        }
        return modifyFiled;
      },
    );

    //
    andConditions.push({
      $and: condition,
    });
  }
  // console.log(andConditions)
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

  // const result = await PaymentHistory.find(whereConditions)
  //   .populate('thumbnail')
  //   .sort(sortConditions)
  //   .skip(Number(skip))
  //   .limit(Number(limit));
  const pipeline: PipelineStage[] = [
    { $match: whereConditions },
    {
      $addFields: {
        year: { $year: '$createdAt' },
        monthNumber: { $month: '$createdAt' }, // Directly extract month number
      },
    },
    {
      $match: {
        year: Number(yearToQuery),
      },
    },
    {
      $project: {
        yearMonth: {
          $dateToString: {
            format: '%Y-%m',
            date: '$createdAt',
          },
        },
        amount: 1,
        monthNumber: 1, // Include monthNumber for later use
      },
    },
    {
      $group: {
        _id: '$yearMonth',
        totalAmount: { $sum: '$amount' },
        monthNumber: { $first: '$monthNumber' }, // Retain monthNumber
      },
    },
    {
      $project: {
        _id: 0,
        month: {
          $let: {
            vars: {
              monthsInString: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
              ],
            },
            in: {
              $arrayElemAt: [
                '$$monthsInString',
                { $subtract: ['$monthNumber', 1] },
              ],
            },
          },
        },
        value: '$totalAmount',
        serialNumber: '$monthNumber',
      },
    },
    {
      $sort: { serialNumber: 1 },
    },
  ];

  const result = await PaymentHistory.aggregate(pipeline);
  const total = 0;

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// get single PaymentHistorye form db
const getSinglePaymentHistoryFromDb = async (
  id: string,
  req: Request,
): Promise<IPaymentHistory | null> => {
  const pipeline: PipelineStage[] = [
    { $match: { _id: new Types.ObjectId(id) } },
  ];
  const result = await PaymentHistory.aggregate(pipeline);
  return result[0];
};

export const PaymentHistoryService = {
  createPaymentHistoryByDb,
  getAllPaymentHistoryFromDb,
  getAllTimeToGroupPaymentHistoryFromDb,
  getAllTransactionFromDb,
  getAllChartOfValueFromDb,
  getSinglePaymentHistoryFromDb,
  //
};
