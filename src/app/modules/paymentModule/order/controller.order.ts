/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from 'express';

import { PAGINATION_FIELDS } from '../../../../global/constant/pagination';
import catchAsync from '../../../share/catchAsync';
import pick from '../../../share/pick';
import sendResponse from '../../../share/sendResponse';
import { IUserRefAndDetails } from '../../allUser/typesAndConst';
import { RequestToRefUserObject } from '../../allUser/user/user.utils';
import { OrderFilterableFields } from './constants.order';
import { IOrder, IOrderFilters } from './interface.order';
import { OrderService } from './service.order';

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const bodyDate = req.body as IOrder;
  const changeBodyDate = {
    ...bodyDate,
    author: RequestToRefUserObject(req.user as IUserRefAndDetails),
  } as IOrder;

  const result = await OrderService.createOrderFromDb(
    changeBodyDate,
    req.user as IUserRefAndDetails,
  );
  sendResponse<IOrder>(req, res, {
    statusCode: 200,
    success: true,
    message: 'Order created successfully',
    data: result,
  });
});

//get all Orders
const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserRefAndDetails;
  const filters = pick(req.query, OrderFilterableFields) as IOrderFilters;
  const paginationOptions = pick(req.query, PAGINATION_FIELDS);

  const result = await OrderService.getAllOrdersFromDB(
    filters,
    paginationOptions,
    user,
    req,
  );

  sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: 'Orders found successfully',
    data: result.data,
    meta: result.meta,
  });
});

//get a Order by id
const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getSingleOrderFromDB(
    req.params.id,
    req.user as IUserRefAndDetails,
    req,
  );

  sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: 'Order found successfully',
    data: result,
  });
});
const getDashboardStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getDashboardStatusFromDB(
    req.params.id,
    req.user as IUserRefAndDetails,
    req,
  );

  sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: 'Order found successfully',
    data: result,
  });
});

//update Order
const updateOrder = catchAsync(async (req: Request, res: Response) => {
  // await RequestToFileDecodeAddBodyHandle(req);
  const result = await OrderService.updateOrderFromDB(
    req.params.id,
    req.body,
    req.user as IUserRefAndDetails,
    req,
  );

  sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: 'Order updated successfully',
    data: result,
  });
});

const orderComplete = catchAsync(async (req: Request, res: Response) => {
  // await RequestToFileDecodeAddBodyHandle(req);
  const result = await OrderService.orderCompleteFromDB(
    req.params.id,
    req.body,
    req.user as IUserRefAndDetails,
    req,
  );

  sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: 'Order Complete successfully',
    data: result,
  });
});

//delete Order
const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await OrderService.deleteOrderFromDB(
    id,
    req.query,
    req.user as IUserRefAndDetails,
    req,
  );

  sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: 'Order deleted successfully',
    data: result,
  });
});

export const OrdersController = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  //
  getDashboardStatus,
  //
  orderComplete,
  //
};
