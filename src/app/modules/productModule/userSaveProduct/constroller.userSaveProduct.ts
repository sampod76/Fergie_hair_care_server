/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from 'express';
import httpStatus from 'http-status';

import { PAGINATION_FIELDS } from '../../../../global/constant/pagination';
import catchAsync from '../../../share/catchAsync';
import pick from '../../../share/pick';
import sendResponse from '../../../share/sendResponse';
import { IUserRef } from '../../allUser/typesAndConst';
import { userSaveProduct_FILTERABLE_FIELDS } from './consent.userSaveProduct';
import { IUserSaveProduct } from './interface.userSaveProduct';
import { UserSaveProductService } from './service.userSaveProduct';
import { RequestToRefUserObject } from '../../allUser/user/user.utils';

// import { z } from 'zod'
const createUserSaveProduct = catchAsync(
  async (req: Request, res: Response) => {
    req.body = {
      ...req.body,
      author: RequestToRefUserObject(req.user as IUserRef),
    };

    //----------------------------------------------------------------
    const result = await UserSaveProductService.createUserSaveProductByDb(
      req.body,
      req,
    );

    sendResponse<IUserSaveProduct>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successful create UserSaveProduct',
      data: result,
    });
  },
);

const getAllUserSaveProduct = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, userSaveProduct_FILTERABLE_FIELDS);
    const paginationOptions = pick(req.query, PAGINATION_FIELDS);

    const result = await UserSaveProductService.getAllUserSaveProductFromDb(
      filters,
      paginationOptions,
      req,
    );

    sendResponse<IUserSaveProduct[]>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully Get all UserSaveProduct',
      meta: result.meta,
      data: result.data,
    });
    // next();
  },
);

const getSingleUserSaveProduct = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    /*   if (!globalImport.ObjectId.isValid(id)) {
      throw new ApiError(400, 'invalid id sampod');
    } */

    const filters = pick(req.query, userSaveProduct_FILTERABLE_FIELDS);

    const result = await UserSaveProductService.getSingleUserSaveProductFromDb(
      id,
      filters,
      req,
    );

    sendResponse<IUserSaveProduct>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully get UserSaveProduct',
      data: result,
    });
  },
);
const updateUserSaveProduct = catchAsync(
  async (req: Request, res: Response) => {
    //  await RequestToFileDecodeAddBodyHandle(req);
    //-----------------------fil--upload--------------------------
    //when single file upload. image:{} --> in the multer->fields-> in single file max:1
    if (Array.isArray(req.body?.image) && req.body?.image?.length) {
      const singleImage = req.body?.image[0];
      req.body = {
        ...req.body,
        image: singleImage,
      };
    }
    //----------------------------------------------------------------
    const { id } = req.params;
    const updateData = req.body;

    const result = await UserSaveProductService.updateUserSaveProductFromDb(
      id,
      updateData,
      req.user as IUserRef,
      req,
    );

    sendResponse<IUserSaveProduct>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully update UserSaveProduct',
      data: result,
    });
  },
);
const updateUserSaveProductSerialNumber = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await UserSaveProductService.updateUserSaveProductSerialNumberFromDb(
        req.body,
      );

    sendResponse<IUserSaveProduct[]>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully update UserSaveProduct',
      data: result,
    });
  },
);

const deleteUserSaveProduct = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await UserSaveProductService.deleteUserSaveProductByIdFromDb(
      id,
      req.query,
      req.user as IUserRef,
      req,
    );
    sendResponse<IUserSaveProduct>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully delete UserSaveProduct',
      data: result,
    });
  },
);
export const UserSaveProductController = {
  createUserSaveProduct,
  getAllUserSaveProduct,
  getSingleUserSaveProduct,
  updateUserSaveProduct,
  deleteUserSaveProduct,
  //
  updateUserSaveProductSerialNumber,
};
