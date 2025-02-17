import express from 'express';
import { NotificationController } from './notification.controller';

import { ENUM_USER_ROLE } from '../../../global/enums/users';
import authMiddleware from '../../middlewares/authMiddleware';

import { uploadImage } from '../../middlewares/uploader.multer';
import parseBodyData from '../../middlewares/utils/parseBodyData';

const router = express.Router();

router.get(
  '/',
  authMiddleware(
    ENUM_USER_ROLE.admin,
    ENUM_USER_ROLE.superAdmin,

    ENUM_USER_ROLE.generalUser,
  ),
  NotificationController.getAllNotifications,
);
router.post(
  '/create-notification',
  authMiddleware(
    ENUM_USER_ROLE.admin,
    ENUM_USER_ROLE.superAdmin,

    ENUM_USER_ROLE.generalUser,
  ),

  // uploadAwsS3Bucket.single('image'),
  uploadImage.single('image'),
  parseBodyData({}),
  NotificationController.createNotification,
);
router
  .route('/:id')
  .get(
    authMiddleware(
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.superAdmin,

      ENUM_USER_ROLE.generalUser,
    ),
    NotificationController.getSingleNotification,
  )
  .patch(
    authMiddleware(
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.superAdmin,

      ENUM_USER_ROLE.generalUser,
    ),

    // uploadAwsS3Bucket.single('image'),
    uploadImage.single('image'),
    parseBodyData({}),
    NotificationController.updateNotification,
  )
  .delete(
    authMiddleware(
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.superAdmin,

      ENUM_USER_ROLE.generalUser,
    ),
    NotificationController.deleteNotification,
  );

export const NotificationRoute = router;
