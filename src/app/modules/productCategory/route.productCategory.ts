import express from 'express';
import { ENUM_USER_ROLE } from '../../../global/enums/users';
import authMiddleware from '../../middlewares/authMiddleware';

import { z } from 'zod';
import parseBodyData from '../../middlewares/utils/parseBodyData';
import validateRequestZod from '../../middlewares/validateRequestZod';
import { uploadAwsS3Bucket } from '../aws/utls.aws';
import { ProductCategoryController } from './constroller.productCategory';
import { ProductCategoryValidation } from './validation.productCategory';

const router = express.Router();

router
  .route('/')
  // This route is open
  .get(ProductCategoryController.getAllProductCategory)
  .post(
    authMiddleware(ENUM_USER_ROLE.admin, ENUM_USER_ROLE.superAdmin),
    // uploadImage.single('image'),
    uploadAwsS3Bucket.single('image'),
    parseBodyData({}),
    validateRequestZod(
      ProductCategoryValidation.createProductCategoryZodSchema,
    ),
    ProductCategoryController.createProductCategory,
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
  ProductCategoryController.updateProductCategorySerialNumber,
);

router
  .route('/:id')
  // This route is open
  .get(ProductCategoryController.getSingleProductCategory)
  .patch(
    authMiddleware(ENUM_USER_ROLE.admin, ENUM_USER_ROLE.superAdmin),
    uploadAwsS3Bucket.single('image'),
    parseBodyData({}),
    validateRequestZod(
      ProductCategoryValidation.updateProductCategoryZodSchema,
    ),
    ProductCategoryController.updateProductCategory,
  )
  .delete(
    authMiddleware(ENUM_USER_ROLE.admin, ENUM_USER_ROLE.superAdmin),
    ProductCategoryController.deleteProductCategory,
  );

export const ProductCategoryRoute = router;
