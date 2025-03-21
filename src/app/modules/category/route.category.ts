import express from 'express';
import { ENUM_USER_ROLE } from '../../../global/enums/users';
import authMiddleware from '../../middlewares/authMiddleware';

import { z } from 'zod';
import parseBodyData from '../../middlewares/utils/parseBodyData';
import validateRequestZod from '../../middlewares/validateRequestZod';
import { uploadAwsS3Bucket } from '../aws/utls.aws';
import { CategoryController } from './controller.category';
import { CATEGORY_TYPE_ARRAY, I_CategoryType } from './interface.category';
import { CategoryValidation } from './validation.category';

const router = express.Router();

router
  .route('/')
  // This route is open
  .get(
    validateRequestZod(
      z.object({
        query: z.object({
          categoryType: z.enum(CATEGORY_TYPE_ARRAY as [I_CategoryType], {
            required_error: 'Query parameters in must be provide categoryType',
          }),
        }),
      }),
    ),
    CategoryController.getAllCategory,
  )
  .post(
    authMiddleware(ENUM_USER_ROLE.admin, ENUM_USER_ROLE.superAdmin),
    uploadAwsS3Bucket.single('image'),
    // uploadAwsS3Bucket.fields([
    //   { name: 'image', maxCount: 1 },
    //   { name: 'files', maxCount: 10 },
    // ]),
    parseBodyData({}),
    validateRequestZod(CategoryValidation.createCategoryZodSchema),
    CategoryController.createCategory,
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
  CategoryController.updateCategorySerialNumber,
);

router
  .route('/:id')
  // This route is open
  .get(CategoryController.getSingleCategory)
  .patch(
    authMiddleware(ENUM_USER_ROLE.admin, ENUM_USER_ROLE.superAdmin),
    uploadAwsS3Bucket.single('image'),
    // uploadAwsS3Bucket.fields([
    //   { name: 'image', maxCount: 1 },
    //   { name: 'files', maxCount: 10 },
    // ]),
    parseBodyData({}),
    validateRequestZod(CategoryValidation.updateCategoryZodSchema),
    CategoryController.updateCategory,
  )
  .delete(
    authMiddleware(ENUM_USER_ROLE.admin, ENUM_USER_ROLE.superAdmin),
    CategoryController.deleteCategory,
  );

export const CategoryRoute = router;
