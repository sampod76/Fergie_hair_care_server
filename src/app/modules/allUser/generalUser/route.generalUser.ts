import express from 'express';
import { z } from 'zod';
import { ENUM_USER_ROLE } from '../../../../global/enums/users';
import authMiddleware from '../../../middlewares/authMiddleware';

import parseBodyData from '../../../middlewares/utils/parseBodyData';
import validateRequestZod from '../../../middlewares/validateRequestZod';
import { uploadAwsS3Bucket } from '../../aws/utls.aws';
import { GeneralUserController } from './controller.generalUser';
import { GeneralUserValidation } from './validation.generalUser';

const router = express.Router();

router.route('/').get(GeneralUserController.getAllGeneralUsers);

router
  .route('/:id')
  .get(GeneralUserController.getSingleGeneralUser)
  .patch(
    authMiddleware(
      ENUM_USER_ROLE.superAdmin,
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.generalUser,
    ),
    // uploadAwsS3Bucket.fields([{ name: 'profileImage', maxCount: 1 }]),
    // uploadImage.single('profileImage'),
    uploadAwsS3Bucket.single('profileImage'),
    parseBodyData({}),
    validateRequestZod(GeneralUserValidation.updateGeneralUserSchema),
    GeneralUserController.updateGeneralUser,
  )
  .delete(
    authMiddleware(
      ENUM_USER_ROLE.superAdmin,
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.generalUser,
    ),
    validateRequestZod(
      z.object({
        body: z.object({
          password: z.string().optional(),
        }),
      }),
    ),
    GeneralUserController.deleteGeneralUser,
  );

export const GeneralUserRoutes = router;
