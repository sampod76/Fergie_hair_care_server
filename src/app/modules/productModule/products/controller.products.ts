/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from 'express';
import httpStatus from 'http-status';

import { PAGINATION_FIELDS } from '../../../../global/constant/pagination';
import catchAsync from '../../../share/catchAsync';
import pick from '../../../share/pick';
import sendResponse from '../../../share/sendResponse';
import { IUserRef } from '../../allUser/typesAndConst';
import { Product_FILTERABLE_FIELDS } from './constant.products';
import { IProduct } from './interface.products';
import { ProductService } from './service.products';

// import { z } from 'zod'
const createProduct = catchAsync(async (req: Request, res: Response) => {
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
  const result = await ProductService.createProductByDb(req.body, req);

  sendResponse<IProduct>(req, res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successful create Product',
    data: result,
  });
});

const getAllProduct = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, Product_FILTERABLE_FIELDS);
  const paginationOptions = pick(req.query, PAGINATION_FIELDS);

  const result = await ProductService.getAllProductFromDb(
    filters,
    paginationOptions,
    req,
  );

  sendResponse<IProduct[]>(req, res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successfully Get all Product',
    meta: result.meta,
    data: result.data,
  });
  // next();
});

const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  /*   if (!globalImport.ObjectId.isValid(id)) {
      throw new ApiError(400, 'invalid id sampod');
    } */

  const filters = pick(req.query, Product_FILTERABLE_FIELDS);

  const result = await ProductService.getSingleProductFromDb(id, filters, req);

  sendResponse<IProduct>(req, res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successfully get Product',
    data: result,
  });
});
const updateProduct = catchAsync(async (req: Request, res: Response) => {
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

  const result = await ProductService.updateProductFromDb(
    id,
    updateData,
    req.user as IUserRef,
    req,
  );

  sendResponse<IProduct>(req, res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successfully update Product',
    data: result,
  });
});
const updateProductSerialNumber = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ProductService.updateProductSerialNumberFromDb(
      req.body,
    );

    sendResponse<IProduct[]>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully update Product',
      data: result,
    });
  },
);

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.deleteProductByIdFromDb(
    id,
    req.query,
    req.user as IUserRef,
    req,
  );
  sendResponse<IProduct>(req, res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'successfully delete Product',
    data: result,
  });
});
export const ProductController = {
  createProduct,
  getAllProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  //
  updateProductSerialNumber,
};
