import express from 'express';
import { ENUM_USER_ROLE } from '../../../global/enums/users';
import authMiddleware from '../../middlewares/authMiddleware';

import { z } from 'zod';
import validateRequestZod from '../../middlewares/validateRequestZod';
import { FavoriteProductController } from './constroller.favoriteProduct';
import { FavoriteProductValidation } from './validation.favoriteProduct';

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
    FavoriteProductController.getAllFavoriteProduct,
  )
  .post(
    authMiddleware(
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.superAdmin,
      ENUM_USER_ROLE.generalUser,
    ),

    validateRequestZod(
      FavoriteProductValidation.createFavoriteProductZodSchema,
    ),
    FavoriteProductController.createFavoriteProduct,
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
  FavoriteProductController.updateFavoriteProductSerialNumber,
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
    FavoriteProductController.getSingleFavoriteProduct,
  )
  .patch(
    authMiddleware(
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.superAdmin,
      ENUM_USER_ROLE.generalUser,
    ),

    validateRequestZod(
      FavoriteProductValidation.updateFavoriteProductZodSchema,
    ),
    FavoriteProductController.updateFavoriteProduct,
  )
  .delete(
    authMiddleware(
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.superAdmin,
      ENUM_USER_ROLE.generalUser,
    ),

    FavoriteProductController.deleteFavoriteProduct,
  );

export const FavoriteProductRoute = router;
