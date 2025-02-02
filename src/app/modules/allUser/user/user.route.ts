import express from 'express';
import { z } from 'zod';
import { ENUM_USER_ROLE } from '../../../../global/enums/users';
import authMiddleware from '../../../middlewares/authMiddleware';
import parseBodyData from '../../../middlewares/utils/parseBodyData';
import validateRequestZod from '../../../middlewares/validateRequestZod';
import { uploadAwsS3Bucket } from '../../aws/utls.aws';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';

const router = express.Router();

router
  .route('/')
  .get(
    authMiddleware(
      ENUM_USER_ROLE.superAdmin,
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.vendor,
    ),
    UserController.getAllUsers,
  )
  .post(
    // uploadAwsS3Bucket.single('profileImage'),
    // parseBodyData({}),
    validateRequestZod(UserValidation.createUserZodSchema),
    UserController.createUser,
  );
router.route('/create-account-google').post(
  // uploadAwsS3Bucket.single('profileImage'),
  // parseBodyData({}),
  // validateRequestZod(UserValidation.createUserZodSchema),
  UserController.createUserByGoogle,
);
router
  .route('/dashboard')
  .get(
    authMiddleware(
      ENUM_USER_ROLE.superAdmin,
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.vendor,
    ),
    UserController.dashboardUsers,
  );

router.route('/isOnline/:userid').get(UserController.isOnline);
router
  .route('/author-to-create') // create user by this ruler
  .post(
    authMiddleware(ENUM_USER_ROLE.superAdmin, ENUM_USER_ROLE.admin),
    uploadAwsS3Bucket.single('profileImage'),
    parseBodyData({}),
    validateRequestZod(UserValidation.createUserZodSchema),
    UserController.createUser,
  );

router
  .route('/temp-user')
  .post(
    validateRequestZod(UserValidation.tempUser),
    UserController.createUserTempUser,
  );

router
  .route('/:id')
  .get(UserController.getSingleUser)
  .patch(
    authMiddleware(
      ENUM_USER_ROLE.superAdmin,
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.generalUser,
      ENUM_USER_ROLE.vendor,
    ),
    validateRequestZod(UserValidation.updateUserZodSchema),
    UserController.updateUser,
  )
  .delete(
    authMiddleware(
      ENUM_USER_ROLE.superAdmin,
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.vendor,
      ENUM_USER_ROLE.generalUser,
    ),
    validateRequestZod(
      z.object({
        body: z.object({
          password: z.string().optional(),
        }),
      }),
    ),
    UserController.deleteUser,
  );

export const userRoutes = router;
