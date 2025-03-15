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
import { RoutingReminder_FILTERABLE_FIELDS } from './constant.RoutingReminder';
import { IRoutingReminder } from './interface.RoutingReminder';
import { RoutingReminderService } from './service.RoutingReminder';

// import { z } from 'zod'
const createRoutingReminder = catchAsync(
  async (req: Request, res: Response) => {
    req.body = {
      ...req.body,
      author: RequestToRefUserObject(req.user as IUserRef),
    };
    const result = await RoutingReminderService.createRoutingReminderByDb(
      req.body,
      req,
    );
    sendResponse<IRoutingReminder>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successful create RoutingReminder',
      data: result,
    });
  },
);

const getAllRoutingReminder = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, RoutingReminder_FILTERABLE_FIELDS);
    const paginationOptions = pick(req.query, PAGINATION_FIELDS);

    const result = await RoutingReminderService.getAllRoutingReminderFromDb(
      filters,
      paginationOptions,
      req,
    );

    sendResponse<IRoutingReminder[]>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully Get all RoutingReminder',
      meta: result.meta,
      data: result.data,
    });
    // next();
  },
);

const getSingleRoutingReminder = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    /*   if (!globalImport.ObjectId.isValid(id)) {
      throw new ApiError(400, 'invalid id sampod');
    } */

    const filters = pick(req.query, RoutingReminder_FILTERABLE_FIELDS);

    const result = await RoutingReminderService.getSingleRoutingReminderFromDb(
      id,
      filters,
      req,
    );

    sendResponse<IRoutingReminder>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully get RoutingReminder',
      data: result,
    });
  },
);
const updateRoutingReminder = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const result = await RoutingReminderService.updateRoutingReminderFromDb(
      id,
      updateData,
      req,
    );

    sendResponse<IRoutingReminder>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully update RoutingReminder',
      data: result,
    });
  },
);
const updateRoutingReminderSerialNumber = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await RoutingReminderService.updateRoutingReminderSerialNumberFromDb(
        req.body,
      );

    sendResponse<IRoutingReminder[]>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully update RoutingReminder',
      data: result,
    });
  },
);

const deleteRoutingReminder = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await RoutingReminderService.deleteRoutingReminderByIdFromDb(
      id,
      req.query,
      req,
    );
    sendResponse<IRoutingReminder>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully delete RoutingReminder',
      data: result,
    });
  },
);
export const RoutingReminderController = {
  createRoutingReminder,
  getAllRoutingReminder,
  getSingleRoutingReminder,
  updateRoutingReminder,
  deleteRoutingReminder,
  //
  updateRoutingReminderSerialNumber,
};
