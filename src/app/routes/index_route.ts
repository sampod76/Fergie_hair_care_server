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

import { AddToCartRoute } from '../modules/addToCart/route.addToCart';
import { GeneralUserRoutes } from '../modules/allUser/generalUser/route.generalUser';
import { FavoriteProductRoute } from '../modules/favoriteProduct/route.favoriteProduct';
import { FriendShipsRoute } from '../modules/messageingModules/friendship/friendship.route';
import { ChatMessageRoute } from '../modules/messageingModules/message/messages.route';
import { OrdersRoute } from '../modules/paymentModule/order/route.order';
import { PaymentRoute } from '../modules/paymentModule/payment/payment.router';
import { PaymentHistoryRoute } from '../modules/paymentModule/paymentHistory/route.paymentHistory';
import { ProductCategoryRoute } from '../modules/productCategory/route.productCategory';
import { ProductRoute } from '../modules/productModule/products/route.products';
import { UserSaveProductRoute } from '../modules/productModule/userSaveProduct/route.userSaveProduct';
import { RoutingReminderRoute } from '../modules/routingReminder/route.RoutingReminder';
import { ServiceLoggerRoute } from '../modules/serviceLogger/route.serviceLogger';
import { TipsAndGuidelineRoute } from '../modules/tipsAndGuideline/route.TipsAndGuideline';

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
    path: '/add-to-cart',
    route: AddToCartRoute,
  },
  {
    path: '/favorite-products',
    route: FavoriteProductRoute,
  },
  {
    path: '/service-logger',
    route: ServiceLoggerRoute,
  },
  {
    path: '/routing-reminder',
    route: RoutingReminderRoute,
  },

  {
    path: '/tips-guideline',
    route: TipsAndGuidelineRoute,
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
    path: '/payment',
    route: PaymentRoute,
  },
  {
    path: '/payment-history',
    route: PaymentHistoryRoute,
  },
  {
    path: '/order',
    route: OrdersRoute,
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
