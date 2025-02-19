
import express from 'express';
import { ENUM_USER_ROLE } from '../../../global/enums/users';
import authMiddleware from '../../middlewares/authMiddleware';

import { z } from 'zod';
import validateRequestZod from '../../middlewares/validateRequestZod';
import { RoutingReminderController } from './controller.RoutingReminder';
import { RoutingReminderValidation } from './validation.RoutingReminder';

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
    RoutingReminderController.getAllRoutingReminder,
  )
  .post(
    authMiddleware(
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.superAdmin,
      ENUM_USER_ROLE.generalUser,
    ),

    validateRequestZod(
      RoutingReminderValidation.createRoutingReminderZodSchema,
    ),
    RoutingReminderController.createRoutingReminder,
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
  RoutingReminderController.updateRoutingReminderSerialNumber,
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
    RoutingReminderController.getSingleRoutingReminder,
  )
  .patch(
    authMiddleware(
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.superAdmin,
      ENUM_USER_ROLE.generalUser,
    ),

    validateRequestZod(
      RoutingReminderValidation.updateRoutingReminderZodSchema,
    ),
    RoutingReminderController.updateRoutingReminder,
  )
  .delete(
    authMiddleware(
      ENUM_USER_ROLE.admin,
      ENUM_USER_ROLE.superAdmin,
      ENUM_USER_ROLE.generalUser,
    ),

    RoutingReminderController.deleteRoutingReminder,
  );

export const RoutingReminderRoute = router;

