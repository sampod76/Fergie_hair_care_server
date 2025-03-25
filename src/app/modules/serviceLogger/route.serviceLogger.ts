import express from 'express';
import { ENUM_USER_ROLE } from '../../../global/enums/users';
import authMiddleware from '../../middlewares/authMiddleware';

import { z } from 'zod';
import parseBodyData from '../../middlewares/utils/parseBodyData';
import validateRequestZod from '../../middlewares/validateRequestZod';
import { uploadAwsS3Bucket } from '../aws/utls.aws';
import { ServiceLoggerController } from './controller.serviceLogger';
import { IServiceLogger } from './interface.serviceLogger';
import { ServiceLoggerValidation } from './validation.serviceLogger';

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
    ServiceLoggerController.getAllServiceLogger,
  )
  .post(
    authMiddleware(
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.superAdmin,
      ENUM_USER_ROLE.generalUser,
    ),
    uploadAwsS3Bucket.array('images'),
    parseBodyData({}),
    (req, res, next) => {
      const payload = req.body as IServiceLogger;
      if (typeof payload.categories === 'string') {
        payload.categories = JSON.parse(payload.categories);
      }
      if (typeof payload.images === 'string') {
        payload.images = JSON.parse(payload.images);
      }
      console.log('🚀 ~ payload:', payload);
      next();
    },
    validateRequestZod(ServiceLoggerValidation.createServiceLoggerZodSchema),
    ServiceLoggerController.createServiceLogger,
  );
router.route('/serialnumber-update').patch(
  authMiddleware(
    ENUM_USER_ROLE.admin,
    ENUM_USER_ROLE.superAdmin,
    ENUM_USER_ROLE.generalUser,
  ),

  validateRequestZod(
    z.object({
      body: z.array(z.object({ _id: z.string(), number: z.number() })),
    }),
  ),
  ServiceLoggerController.updateServiceLoggerSerialNumber,
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
    ServiceLoggerController.getSingleServiceLogger,
  )
  .patch(
    authMiddleware(
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.superAdmin,
      ENUM_USER_ROLE.generalUser,
    ),
    uploadAwsS3Bucket.array('images'),
    parseBodyData({}),
    validateRequestZod(ServiceLoggerValidation.updateServiceLoggerZodSchema),
    ServiceLoggerController.updateServiceLogger,
  )
  .delete(
    authMiddleware(
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.superAdmin,
      ENUM_USER_ROLE.generalUser,
    ),

    ServiceLoggerController.deleteServiceLogger,
  );

export const ServiceLoggerRoute = router;
