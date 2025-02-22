import express from 'express';
import { ENUM_USER_ROLE } from '../../../global/enums/users';
import authMiddleware from '../../middlewares/authMiddleware';

import { z } from 'zod';
import parseBodyData from '../../middlewares/utils/parseBodyData';
import validateRequestZod from '../../middlewares/validateRequestZod';
import { uploadAwsS3Bucket } from '../aws/utls.aws';
import { TipsAndGuidelineController } from './controller.TipsAndGuideline';
import { TipsAndGuidelineValidation } from './validation.TipsAndGuideline';

const router = express.Router();

router
  .route('/')
  // This route is open
  .get(
    authMiddleware(ENUM_USER_ROLE.admin),
    TipsAndGuidelineController.getAllTipsAndGuideline,
  )
  .post(
    authMiddleware(ENUM_USER_ROLE.admin),
    uploadAwsS3Bucket.array('images'),
    parseBodyData({}),
    validateRequestZod(
      TipsAndGuidelineValidation.createTipsAndGuidelineZodSchema,
    ),
    TipsAndGuidelineController.createTipsAndGuideline,
  );
router.route('/serialnumber-update').patch(
  authMiddleware(ENUM_USER_ROLE.admin),

  validateRequestZod(
    z.object({
      body: z.array(z.object({ _id: z.string(), number: z.number() })),
    }),
  ),
  TipsAndGuidelineController.updateTipsAndGuidelineSerialNumber,
);

router
  .route('/:id')
  // This route is open
  .get(
    authMiddleware(ENUM_USER_ROLE.admin),
    TipsAndGuidelineController.getSingleTipsAndGuideline,
  )
  .patch(
    authMiddleware(ENUM_USER_ROLE.admin),
    uploadAwsS3Bucket.array('images'),
    parseBodyData({}),
    validateRequestZod(
      TipsAndGuidelineValidation.updateTipsAndGuidelineZodSchema,
    ),
    TipsAndGuidelineController.updateTipsAndGuideline,
  )
  .delete(
    authMiddleware(ENUM_USER_ROLE.admin),

    TipsAndGuidelineController.deleteTipsAndGuideline,
  );

export const TipsAndGuidelineRoute = router;
