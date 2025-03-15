/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { PAGINATION_FIELDS } from '../../../global/constant/pagination';
// import { globalImport } from '../../../import/global_Import';
// import ApiError from '../../errors/ApiError';
import catchAsync from '../../share/catchAsync';
import pick from '../../share/pick';
import sendResponse from '../../share/sendResponse';

import { productCategory_FILTERABLE_FIELDS } from './constant.productCategory';
import { IProductCategory } from './interface.productCategory';
import { ProductCategoryService } from './service.productCategory';

// import { z } from 'zod'
const createProductCategory = catchAsync(
  async (req: Request, res: Response) => {
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
    const result = await ProductCategoryService.createProductCategoryByDb(
      req.body,
      req,
    );

    sendResponse<IProductCategory>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successful create ProductCategory',
      data: result,
    });
  },
);

const getAllProductCategory = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, productCategory_FILTERABLE_FIELDS);
    const paginationOptions = pick(req.query, PAGINATION_FIELDS);

    const result = await ProductCategoryService.getAllProductCategoryFromDb(
      filters,
      paginationOptions,
      req,
    );

    sendResponse<IProductCategory[]>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully Get all ProductCategory',
      meta: result.meta,
      data: result.data,
    });
    // next();
  },
);

const getSingleProductCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    /*   if (!globalImport.ObjectId.isValid(id)) {
      throw new ApiError(400, 'invalid id sampod');
    } */

    const filters = pick(req.query, productCategory_FILTERABLE_FIELDS);

    const result = await ProductCategoryService.getSingleProductCategoryFromDb(
      id,
      filters,
      req,
    );

    sendResponse<IProductCategory>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully get ProductCategory',
      data: result,
    });
  },
);
const updateProductCategory = catchAsync(
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

    const result = await ProductCategoryService.updateProductCategoryFromDb(
      id,
      updateData,
      req,
    );

    sendResponse<IProductCategory>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully update ProductCategory',
      data: result,
    });
  },
);
const updateProductCategorySerialNumber = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await ProductCategoryService.updateProductCategorySerialNumberFromDb(
        req.body,
      );

    sendResponse<IProductCategory[]>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully update ProductCategory',
      data: result,
    });
  },
);

const deleteProductCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ProductCategoryService.deleteProductCategoryByIdFromDb(
      id,
      req.query,
      req,
    );
    sendResponse<IProductCategory>(req, res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'successfully delete ProductCategory',
      data: result,
    });
  },
);
export const ProductCategoryController = {
  createProductCategory,
  getAllProductCategory,
  getSingleProductCategory,
  updateProductCategory,
  deleteProductCategory,
  //
  updateProductCategorySerialNumber,
};
