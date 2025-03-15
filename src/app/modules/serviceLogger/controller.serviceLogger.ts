/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { PAGINATION_FIELDS } from '../../../global/constant/pagination';
// import { globalImport } from '../../../import/global_Import';
// import ApiError from '../../errors/ApiError';
import catchAsync from '../../share/catchAsync';
import pick from '../../share/pick';
import sendResponse from '../../share/sendResponse';

import { IUserRef } from '../allUser/typesAndConst';
import { RequestToRefUserObject } from '../allUser/user/user.utils';
import { ServiceLogger_FILTERABLE_FIELDS } from './constant.serviceLogger';
import { IServiceLogger } from './interface.serviceLogger';
import { ServiceLoggerService } from './service.serviceLogger';

// import { z } from 'zod'
const createServiceLogger = catchAsync(async (req: Request, res: Response) => {
  req.body = {
    ...req.body,
    author: RequestToRefUserObject(req.user as IUserRef),
  };
  const result = await ServiceLoggerService.createServiceLoggerByDb(
    req.body,
    req,
  );
  sendResponse<IServiceLogger>(req, res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successful create ServiceLogger',
    data: result,
  });
});

const getAllServiceLogger = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ServiceLogger_FILTERABLE_FIELDS);
  const paginationOptions = pick(req.query, PAGINATION_FIELDS);

  const result = await ServiceLoggerService.getAllServiceLoggerFromDb(
    filters,
    paginationOptions,
    req,
  );

  sendResponse<IServiceLogger[]>(req, res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successfully Get all ServiceLogger',
    meta: result.meta,
    data: result.data,
  });
  // next();
});

const getSingleServiceLogger = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    /*   if (!globalImport.ObjectId.isValid(id)) {
      throw new ApiError(400, 'invalid id sampod');
    } */

    const filters = pick(req.query, ServiceLogger_FILTERABLE_FIELDS);

    const result = await ServiceLoggerService.getSingleServiceLoggerFromDb(
      id,
      filters,
      req,
    );

    sendResponse<IServiceLogger>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully get ServiceLogger',
      data: result,
    });
  },
);
const updateServiceLogger = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const result = await ServiceLoggerService.updateServiceLoggerFromDb(
    id,
    updateData,
    req,
  );

  sendResponse<IServiceLogger>(req, res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successfully update ServiceLogger',
    data: result,
  });
});
const updateServiceLoggerSerialNumber = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await ServiceLoggerService.updateServiceLoggerSerialNumberFromDb(
        req.body,
      );

    sendResponse<IServiceLogger[]>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully update ServiceLogger',
      data: result,
    });
  },
);

const deleteServiceLogger = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ServiceLoggerService.deleteServiceLoggerByIdFromDb(
    id,
    req.query,
    req,
  );
  sendResponse<IServiceLogger>(req, res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successfully delete ServiceLogger',
    data: result,
  });
});
export const ServiceLoggerController = {
  createServiceLogger,
  getAllServiceLogger,
  getSingleServiceLogger,
  updateServiceLogger,
  deleteServiceLogger,
  //
  updateServiceLoggerSerialNumber,
};
