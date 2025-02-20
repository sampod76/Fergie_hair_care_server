import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../share/catchAsync';
import pick from '../../../share/pick';
import sendResponse from '../../../share/sendResponse';

import { PAGINATION_FIELDS } from '../../../../global/constant/pagination';
import { PAYMENT_HISTORY_FILTERABLE_FIELDS } from './consent.paymentHistory';
import { IPaymentHistory } from './interface.paymentHistory';
import { PaymentHistoryService } from './service.paymentHistory';

// import { z } from 'zod'
const createPaymentHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentHistoryService.createPaymentHistoryByDb(
    req.body,
    req,
  );

  sendResponse<any>(req, res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successfully create PaymentHistory',
    data: result,
  });
});

const getAllPaymentHistory = catchAsync(async (req: Request, res: Response) => {
  //****************search and filter start******* */

  const filters = pick(req.query, PAYMENT_HISTORY_FILTERABLE_FIELDS);

  const paginationOptions = pick(req.query, PAGINATION_FIELDS);

  const result = await PaymentHistoryService.getAllPaymentHistoryFromDb(
    filters,
    paginationOptions,
    req,
  );

  sendResponse<IPaymentHistory[]>(req, res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successfully Get PaymentHistory',
    meta: result.meta,
    data: result.data,
  });
  // next();
});
const getAllTransaction = catchAsync(async (req: Request, res: Response) => {
  //****************search and filter start******* */

  const filters = pick(req.query, PAYMENT_HISTORY_FILTERABLE_FIELDS);

  const paginationOptions = pick(req.query, PAGINATION_FIELDS);

  const result = await PaymentHistoryService.getAllTransactionFromDb(
    filters,
    paginationOptions,
    req,
  );

  sendResponse<IPaymentHistory[]>(req, res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successfully Get PaymentHistory',
    meta: result.meta,
    data: result.data,
  });
  // next();
});
const getAllChartOfValue = catchAsync(async (req: Request, res: Response) => {
  //****************search and filter start******* */

  const filters = pick(req.query, PAYMENT_HISTORY_FILTERABLE_FIELDS);

  const paginationOptions = pick(req.query, PAGINATION_FIELDS);

  const result = await PaymentHistoryService.getAllChartOfValueFromDb(
    filters,
    paginationOptions,
    req,
  );

  sendResponse<IPaymentHistory[]>(req, res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successfully Get PaymentHistory',
    meta: result.meta,
    data: result.data,
  });
  // next();
});
const getAllTimeToGroupPaymentHistory = catchAsync(
  async (req: Request, res: Response) => {
    //****************search and filter start******* */
    const filters = pick(req.query, PAYMENT_HISTORY_FILTERABLE_FIELDS);

    //****************pagination start************ */
    const paginationOptions = pick(req.query, PAGINATION_FIELDS);
    const result =
      await PaymentHistoryService.getAllTimeToGroupPaymentHistoryFromDb(
        filters,
        paginationOptions,
        req,
      );

    sendResponse<IPaymentHistory[]>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully Get PaymentHistory',
      meta: result.meta,
      data: result.data,
    });
    // next();
  },
);

const getSinglePaymentHistory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    /*   if (!globalImport.ObjectId.isValid(id)) {
      throw new ApiError(400, 'invalid id sampod');
    } */
    const result = await PaymentHistoryService.getSinglePaymentHistoryFromDb(
      id,
      req,
    );

    sendResponse<IPaymentHistory>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully get PaymentHistory',
      data: result,
    });
  },
);

export const PaymentHistoryController = {
  createPaymentHistory,
  getAllPaymentHistory,
  getSinglePaymentHistory,
  getAllTimeToGroupPaymentHistory,
  getAllChartOfValue,
  getAllTransaction,
  //
};
