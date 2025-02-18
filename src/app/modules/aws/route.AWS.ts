import express from 'express';
import { ENUM_USER_ROLE } from '../../../global/enums/users';
import { apiLimiter } from '../../middlewares/api-limited-hite';
import validateRequestZod from '../../middlewares/validateRequestZod';
import { AWSController } from './controller.AWS';
import { AWSValidation } from './validation.AWS';
const router = express.Router();

router.route('/create-aws-upload-files-token').post(
  (req, res, next) => {
    const role = req?.user?.role;
    if (role !== ENUM_USER_ROLE.admin) {
      // Apply rate limiter for non-admin users
      return apiLimiter(30, 3)(req, res, next);
    } else {
      // Apply rate limiter for admin users
      return apiLimiter(10, 5)(req, res, next);
    }
  },
  validateRequestZod(AWSValidation.createAwsUploadFilesToken),
  AWSController.createAwsUploadFilesToken,
);
router
  .route('/getPrivetAwsFile/:filename')
  .post(AWSController.getPrivetAwsFileToken);
//
router.route('/get-all-files').get(AWSController.getFiles);

export const AWSRoute = router;
