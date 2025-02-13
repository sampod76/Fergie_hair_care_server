import express from 'express';

import { z } from 'zod';

import { ENUM_USER_ROLE } from '../../../../global/enums/users';
import authMiddleware from '../../../middlewares/authMiddleware';
import parseBodyData from '../../../middlewares/utils/parseBodyData';
import validateRequestZod from '../../../middlewares/validateRequestZod';
import { uploadAwsS3Bucket } from '../../aws/utls.aws';
import { UserSaveProductController } from './constroller.userSaveProduct';
import { UserSaveProductValidation } from './validation.userSaveProduct';

const router = express.Router();

router
  .route('/')
  // This route is open
  .get(UserSaveProductController.getAllUserSaveProduct)
  .post(
    authMiddleware(ENUM_USER_ROLE.admin, ENUM_USER_ROLE.superAdmin),
    // uploadImage.single('image'),
    uploadAwsS3Bucket.array('images'),
    parseBodyData({}),
    validateRequestZod(
      UserSaveProductValidation.createUserSaveProductZodSchema,
    ),
    UserSaveProductController.createUserSaveProduct,
  );
router.route('/serialnumber-update').patch(
  authMiddleware(
    ENUM_USER_ROLE.admin,
    ENUM_USER_ROLE.superAdmin,
    // ENUM_USER_ROLE.SELLER,
  ),
  validateRequestZod(
    z.object({
      body: z.array(z.object({ _id: z.string(), number: z.number() })),
    }),
  ),
  UserSaveProductController.updateUserSaveProductSerialNumber,
);

router
  .route('/:id')
  // This route is open
  .get(UserSaveProductController.getSingleUserSaveProduct)
  .patch(
    authMiddleware(ENUM_USER_ROLE.admin, ENUM_USER_ROLE.superAdmin),
    uploadAwsS3Bucket.array('images'),
    parseBodyData({}),
    validateRequestZod(
      UserSaveProductValidation.updateUserSaveProductZodSchema,
    ),
    UserSaveProductController.updateUserSaveProduct,
  )
  .delete(
    authMiddleware(ENUM_USER_ROLE.admin, ENUM_USER_ROLE.superAdmin),
    UserSaveProductController.deleteUserSaveProduct,
  );

export const UserSaveProductRoute = router;
