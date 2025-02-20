import express from 'express';

import authMiddleware from '../../../middlewares/authMiddleware';

import { PaymentHistoryController } from './constroller.paymentHistory';

import { ENUM_USER_ROLE } from '../../../../global/enums/users';

const router = express.Router();

router
  .route('/')
  // This route is open
  .get(
    authMiddleware(
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.superAdmin,
      ENUM_USER_ROLE.generalUser,
    ),
    PaymentHistoryController.getAllPaymentHistory,
  );

router
  .route('/get-all-chart-value')
  .get(
    authMiddleware(ENUM_USER_ROLE.admin, ENUM_USER_ROLE.superAdmin),
    PaymentHistoryController.getAllChartOfValue,
  );
router
  .route('/get-all-time-group-amount')
  .get(
    authMiddleware(ENUM_USER_ROLE.admin, ENUM_USER_ROLE.superAdmin),
    PaymentHistoryController.getAllTimeToGroupPaymentHistory,
  );

router
  .route('/transaction')
  .get(
    authMiddleware(
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.superAdmin,
      ENUM_USER_ROLE.generalUser,
    ),
    PaymentHistoryController.getAllTransaction,
  );

router
  .route('/:id')
  // This route is open
  .get(
    authMiddleware(
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.superAdmin,
      ENUM_USER_ROLE.generalUser,
    ),
    PaymentHistoryController.getSinglePaymentHistory,
  );
// .patch(
//   authMiddleware(
//     ENUM_USER_ROLE.admin,
//     ENUM_USER_ROLE.superAdmin,
//     // ENUM_USER_ROLE.generalUser,
//     // ENUM_USER_ROLE.generalUser,
//   ),
//   validateRequestZod(PurchaseValidation.updatePurchaseZodSchema),
//   // PaymentHistoryController.updatePurchase,
// );

export const PaymentHistoryRoute = router;
