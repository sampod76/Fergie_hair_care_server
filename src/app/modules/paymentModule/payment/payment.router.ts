import express from 'express';

import { ENUM_USER_ROLE } from '../../../../global/enums/users';
import authMiddleware from '../../../middlewares/authMiddleware';
import validateRequestZod from '../../../middlewares/validateRequestZod';
import { createPaymentController } from './payment.controller';
import { PaymentValidation } from './payment.validation';

const router = express.Router();

router.route('/stripe/create-payment-intent').post(
  //role*
  authMiddleware(ENUM_USER_ROLE.generalUser),
  validateRequestZod(PaymentValidation.createPaymentStripeZodSchema),
  createPaymentController.createPaymentStripe,
);

// stripe
router.route('/stripe/test').post(
  // authMiddleware(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  createPaymentController.test,
);
router.route('/stripe/success').get(
  // authMiddleware(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  createPaymentController.successStripePayment,
);
router.route('/stripe/cancel').get(
  // authMiddleware(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  createPaymentController.cancelStripePayment,
);

export const PaymentRoute = router;
