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
import { FavoriteProduct_FILTERABLE_FIELDS } from './constant.favoriteProduct';
import { IFavoriteProduct } from './interface.favoriteProduct';
import { FavoriteProductService } from './service.favoriteProduct';

// import { z } from 'zod'
const createFavoriteProduct = catchAsync(
  async (req: Request, res: Response) => {
    req.body = {
      ...req.body,
      author: RequestToRefUserObject(req.user as IUserRef),
    };
    const result = await FavoriteProductService.createFavoriteProductByDb(
      req.body,
      req,
    );
    sendResponse<IFavoriteProduct>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successful create FavoriteProduct',
      data: result,
    });
  },
);

const getAllFavoriteProduct = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, FavoriteProduct_FILTERABLE_FIELDS);
    const paginationOptions = pick(req.query, PAGINATION_FIELDS);

    const result = await FavoriteProductService.getAllFavoriteProductFromDb(
      filters,
      paginationOptions,
      req,
    );

    sendResponse<IFavoriteProduct[]>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully Get all FavoriteProduct',
      meta: result.meta,
      data: result.data,
    });
    // next();
  },
);

const getSingleFavoriteProduct = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    /*   if (!globalImport.ObjectId.isValid(id)) {
      throw new ApiError(400, 'invalid id sampod');
    } */

    const filters = pick(req.query, FavoriteProduct_FILTERABLE_FIELDS);

    const result = await FavoriteProductService.getSingleFavoriteProductFromDb(
      id,
      filters,
      req,
    );

    sendResponse<IFavoriteProduct>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully get FavoriteProduct',
      data: result,
    });
  },
);
const updateFavoriteProduct = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const result = await FavoriteProductService.updateFavoriteProductFromDb(
      id,
      updateData,
      req,
    );

    sendResponse<IFavoriteProduct>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully update FavoriteProduct',
      data: result,
    });
  },
);
const updateFavoriteProductSerialNumber = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await FavoriteProductService.updateFavoriteProductSerialNumberFromDb(
        req.body,
      );

    sendResponse<IFavoriteProduct[]>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully update FavoriteProduct',
      data: result,
    });
  },
);

const deleteFavoriteProduct = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await FavoriteProductService.deleteFavoriteProductByIdFromDb(
      id,
      req.query,
      req,
    );
    sendResponse<IFavoriteProduct>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully delete FavoriteProduct',
      data: result,
    });
  },
);
export const FavoriteProductController = {
  createFavoriteProduct,
  getAllFavoriteProduct,
  getSingleFavoriteProduct,
  updateFavoriteProduct,
  deleteFavoriteProduct,
  //
  updateFavoriteProductSerialNumber,
};
