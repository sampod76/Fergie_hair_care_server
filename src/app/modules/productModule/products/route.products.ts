import express from 'express';

import { z } from 'zod';

import { ENUM_USER_ROLE } from '../../../../global/enums/users';
import authMiddleware from '../../../middlewares/authMiddleware';
import parseBodyData from '../../../middlewares/utils/parseBodyData';
import validateRequestZod from '../../../middlewares/validateRequestZod';
import { uploadAwsS3Bucket } from '../../aws/utls.aws';
import { ProductController } from './constroller.products';
import { ProductValidation } from './validation.products';

const router = express.Router();

router
  .route('/')
  // This route is open
  .get(ProductController.getAllProduct)
  .post(
    authMiddleware(ENUM_USER_ROLE.admin, ENUM_USER_ROLE.superAdmin),
    // uploadImage.single('image'),
    uploadAwsS3Bucket.array('images'),
    parseBodyData({}),
    validateRequestZod(ProductValidation.createProductZodSchema),
    ProductController.createProduct,
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
  ProductController.updateProductSerialNumber,
);

router
  .route('/:id')
  // This route is open
  .get(ProductController.getSingleProduct)
  .patch(
    authMiddleware(ENUM_USER_ROLE.admin, ENUM_USER_ROLE.superAdmin),
    uploadAwsS3Bucket.array('images'),
    parseBodyData({}),
    validateRequestZod(ProductValidation.updateProductZodSchema),
    ProductController.updateProduct,
  )
  .delete(
    authMiddleware(ENUM_USER_ROLE.admin, ENUM_USER_ROLE.superAdmin),
    ProductController.deleteProduct,
  );

export const ProductRoute = router;
