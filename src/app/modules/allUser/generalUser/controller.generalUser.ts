/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';

import httpStatus from 'http-status';
import { PAGINATION_FIELDS } from '../../../../global/constant/pagination';
import catchAsync from '../../../share/catchAsync';
import pick from '../../../share/pick';
import sendResponse from '../../../share/sendResponse';
import { IUserRef } from '../typesAndConst';
import { GeneralUserFilterableFields } from './constant.generalUser';
import { IGeneralUser } from './interface.generalUser';
import { GeneralUserService } from './service.generalUser';

const createGeneralUser = catchAsync(async (req: Request, res: Response) => {
  //-----------------------fil--upload--------------------------
  //when single file upload. image:{} --> in the multer->fields-> in single file max:1
  /*
    if (Array.isArray(req.body?.profileImage) && req.body?.profileImage?.length) {
    const singleImage = req.body?.profileImage[0];
    req.body = {
      ...req.body,
      profileImage: singleImage,
    };
  } 
    */
  //----------------------------------------------------------------
  let data = req.body;
  if (req?.user?.userId) {
    const user = req.user;
    data = {
      ...data,
      author: {
        role: user?.role,
        userId: user?.userId,
        roleBaseUserId: user?.roleBaseUserId,
      },
    };
  }
  const result = await GeneralUserService.createGeneralUser(data, req);
  sendResponse<IGeneralUser>(req, res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'GeneralUser created successfully',
    data: result,
  });
});

const getAllGeneralUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, GeneralUserFilterableFields);
  const paginationOptions = pick(req.query, PAGINATION_FIELDS);
  const result = await GeneralUserService.getAllGeneralUsersFromDB(
    filters,
    paginationOptions,
    req,
  );

  sendResponse<IGeneralUser[]>(req, res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Get all GeneralUsers',
    data: result.data,
    meta: result.meta,
  });
});

const updateGeneralUser = catchAsync(async (req: Request, res: Response) => {
  //-----------------------fil--upload--------------------------
  // await RequestToFileDecodeAddBodyHandle(req);
  //when single file upload. image:{} --> in the multer->fields-> in single file max:1
  /*   if (Array.isArray(req.body?.profileImage) && req.body?.profileImage?.length) {
    const singleImage = req.body?.profileImage[0];
    req.body = {
      ...req.body,
      profileImage: singleImage,
    };
  } */
  //----------------------------------------------------------------
  const { password, role, authentication, ...data } = req.body;
  const id = req.params.id;

  const result = await GeneralUserService.updateGeneralUserFromDB(
    id,
    data,
    req.user as IUserRef,
    req,
  );
  sendResponse<IGeneralUser>(req, res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'GeneralUser updated successfully',
    data: result,
  });
});

const getSingleGeneralUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await GeneralUserService.getSingleGeneralUserFromDB(id, req);
  sendResponse<IGeneralUser>(req, res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'GeneralUser find successfully',
    data: result,
  });
});

const deleteGeneralUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await GeneralUserService.deleteGeneralUserFromDB(
    id,
    req.query,
    req,
  );
  sendResponse<IGeneralUser>(req, res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'GeneralUser deleted successfully',
    data: result,
  });
});

export const GeneralUserController = {
  createGeneralUser,
  getAllGeneralUsers,
  updateGeneralUser,
  getSingleGeneralUser,
  deleteGeneralUser,
};
