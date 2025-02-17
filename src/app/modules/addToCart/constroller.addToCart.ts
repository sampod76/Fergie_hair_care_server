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
import { AddToCart_FILTERABLE_FIELDS } from './consent.addToCart';
import { IAddToCart } from './interface.addToCart';
import { AddToCartService } from './service.addToCart';

// import { z } from 'zod'
const createAddToCart = catchAsync(async (req: Request, res: Response) => {
  req.body = {
    ...req.body,
    author: RequestToRefUserObject(req.user as IUserRef),
  };
  const result = await AddToCartService.createAddToCartByDb(req.body, req);
  sendResponse<IAddToCart>(req, res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successful create AddToCart',
    data: result,
  });
});

const getAllAddToCart = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, AddToCart_FILTERABLE_FIELDS);
  const paginationOptions = pick(req.query, PAGINATION_FIELDS);

  const result = await AddToCartService.getAllAddToCartFromDb(
    filters,
    paginationOptions,
    req,
  );

  sendResponse<IAddToCart[]>(req, res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successfully Get all AddToCart',
    meta: result.meta,
    data: result.data,
  });
  // next();
});

const getSingleAddToCart = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  /*   if (!globalImport.ObjectId.isValid(id)) {
      throw new ApiError(400, 'invalid id sampod');
    } */

  const filters = pick(req.query, AddToCart_FILTERABLE_FIELDS);

  const result = await AddToCartService.getSingleAddToCartFromDb(
    id,
    filters,
    req,
  );

  sendResponse<IAddToCart>(req, res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successfully get AddToCart',
    data: result,
  });
});
const updateAddToCart = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const result = await AddToCartService.updateAddToCartFromDb(
    id,
    updateData,
    req,
  );

  sendResponse<IAddToCart>(req, res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successfully update AddToCart',
    data: result,
  });
});
const updateAddToCartSerialNumber = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AddToCartService.updateAddToCartSerialNumberFromDb(
      req.body,
    );

    sendResponse<IAddToCart[]>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully update AddToCart',
      data: result,
    });
  },
);

const deleteAddToCart = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AddToCartService.deleteAddToCartByIdFromDb(
    id,
    req.query,
    req,
  );
  sendResponse<IAddToCart>(req, res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successfully delete AddToCart',
    data: result,
  });
});
export const AddToCartController = {
  createAddToCart,
  getAllAddToCart,
  getSingleAddToCart,
  updateAddToCart,
  deleteAddToCart,
  //
  updateAddToCartSerialNumber,
};
