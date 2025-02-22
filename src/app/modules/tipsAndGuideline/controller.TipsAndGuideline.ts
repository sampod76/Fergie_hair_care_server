
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
import { TipsAndGuideline_FILTERABLE_FIELDS } from './constant.TipsAndGuideline';
import { ITipsAndGuideline } from './interface.TipsAndGuideline';
import { TipsAndGuidelineService } from './service.TipsAndGuideline';

// import { z } from 'zod'
const createTipsAndGuideline = catchAsync(
  async (req: Request, res: Response) => {
    req.body = {
      ...req.body,
      author: RequestToRefUserObject(req.user as IUserRef),
    };
    const result = await TipsAndGuidelineService.createTipsAndGuidelineByDb(
      req.body,
      req,
    );
    sendResponse<ITipsAndGuideline>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successful create TipsAndGuideline',
      data: result,
    });
  },
);

const getAllTipsAndGuideline = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, TipsAndGuideline_FILTERABLE_FIELDS);
    const paginationOptions = pick(req.query, PAGINATION_FIELDS);

    const result = await TipsAndGuidelineService.getAllTipsAndGuidelineFromDb(
      filters,
      paginationOptions,
      req,
    );

    sendResponse<ITipsAndGuideline[]>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully Get all TipsAndGuideline',
      meta: result.meta,
      data: result.data,
    });
    // next();
  },
);

const getSingleTipsAndGuideline = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    /*   if (!globalImport.ObjectId.isValid(id)) {
      throw new ApiError(400, 'invalid id sampod');
    } */

    const filters = pick(req.query, TipsAndGuideline_FILTERABLE_FIELDS);

    const result = await TipsAndGuidelineService.getSingleTipsAndGuidelineFromDb(
      id,
      filters,
      req,
    );

    sendResponse<ITipsAndGuideline>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully get TipsAndGuideline',
      data: result,
    });
  },
);
const updateTipsAndGuideline = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const result = await TipsAndGuidelineService.updateTipsAndGuidelineFromDb(
      id,
      updateData,
      req,
    );

    sendResponse<ITipsAndGuideline>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully update TipsAndGuideline',
      data: result,
    });
  },
);
const updateTipsAndGuidelineSerialNumber = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await TipsAndGuidelineService.updateTipsAndGuidelineSerialNumberFromDb(
        req.body,
      );

    sendResponse<ITipsAndGuideline[]>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully update TipsAndGuideline',
      data: result,
    });
  },
);

const deleteTipsAndGuideline = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await TipsAndGuidelineService.deleteTipsAndGuidelineByIdFromDb(
      id,
      req.query,
      req,
    );
    sendResponse<ITipsAndGuideline>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully delete TipsAndGuideline',
      data: result,
    });
  },
);
export const TipsAndGuidelineController = {
  createTipsAndGuideline,
  getAllTipsAndGuideline,
  getSingleTipsAndGuideline,
  updateTipsAndGuideline,
  deleteTipsAndGuideline,
  //
  updateTipsAndGuidelineSerialNumber,
};

