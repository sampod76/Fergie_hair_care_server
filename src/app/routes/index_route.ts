import express from 'express';

import { AllTextFieldRoute } from '../modules/AllTextField/route.AllTextField';

import { userRoutes } from '../modules/allUser/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.route';
import { AWSRoute } from '../modules/aws/route.AWS';
import { CategoryRoute } from '../modules/category/route.category';
import { UserLoginHistoryRoutes } from '../modules/loginHistory/loginHistory.route';
import { NotificationRoute } from '../modules/notification/notification.route';

import { adminRoutes } from '../modules/allUser/admin/admin.route';

import { AdminSettingRoute } from '../modules/adminSetting/route.adminSetting';

import { GeneralUserRoutes } from '../modules/allUser/generalUser/route.generalUser';
import { FriendShipsRoute } from '../modules/messageingModules/friendship/friendship.route';
import { ChatMessageRoute } from '../modules/messageingModules/message/messages.route';
import { ProductCategoryRoute } from '../modules/productCategory/route.productCategory';
import { ProductRoute } from '../modules/productModule/products/route.products';
import { UserSaveProductRoute } from '../modules/productModule/userSaveProduct/route.userSaveProduct';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/admins',
    route: adminRoutes,
  },

  {
    path: '/general-users',
    route: GeneralUserRoutes,
  },

  {
    path: '/login_history',
    route: UserLoginHistoryRoutes,
  },

  {
    path: '/category',
    route: CategoryRoute,
  },
  {
    path: '/products-category',
    route: ProductCategoryRoute,
  },
  {
    path: '/products',
    route: ProductRoute,
  },
  {
    path: '/user-save-products',
    route: UserSaveProductRoute,
  },

  {
    path: '/friend-ship',
    route: FriendShipsRoute,
  },
  {
    path: '/chat-messages',
    route: ChatMessageRoute,
  },

  {
    path: '/all-text-fields',
    route: AllTextFieldRoute,
  },

  {
    path: '/notification',
    route: NotificationRoute,
  },
  {
    path: '/admin-setting',
    route: AdminSettingRoute,
  },
  {
    path: '/aws',
    route: AWSRoute,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
