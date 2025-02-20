import express from 'express';

import { ENUM_USER_ROLE } from '../../../../global/enums/users';
import authMiddleware from '../../../middlewares/authMiddleware';
import validateRequestZod from '../../../middlewares/validateRequestZod';
import { OrdersController } from './controller.order';
import { OrderValidation } from './validation.order';
const router = express.Router();

router
  .route('/')
  .get(
    authMiddleware(
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.superAdmin,

      ENUM_USER_ROLE.generalUser,
    ),
    OrdersController.getAllOrders,
  )
  .post(
    authMiddleware(
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.superAdmin,

      ENUM_USER_ROLE.generalUser,
    ),
    // uploadAwsS3Bucket.single('image'),
    // parseBodyData({ required_file_fields: ['image'] }),
    validateRequestZod(OrderValidation.createOrderZodSchema),
    OrdersController.createOrder,
  );

router.route('/dashboard/status').get(
  authMiddleware(
    ENUM_USER_ROLE.admin,
    ENUM_USER_ROLE.superAdmin,

    ENUM_USER_ROLE.generalUser,
  ),
  OrdersController.getDashboardStatus,
);

router
  .route('/:id')
  .get(OrdersController.getOrderById)
  .patch(
    authMiddleware(
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.superAdmin,

      ENUM_USER_ROLE.generalUser,
    ),
    // uploadAwsS3Bucket.single('image'),
    // parseBodyData({}),
    validateRequestZod(OrderValidation.updateOrderZodSchema),
    OrdersController.updateOrder,
  )
  .delete(
    authMiddleware(
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.superAdmin,

      ENUM_USER_ROLE.generalUser,
    ),
    OrdersController.deleteOrder,
  );

export const OrdersRoute = router;
