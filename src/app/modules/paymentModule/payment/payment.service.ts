import { Request } from 'express';
import Stripe from 'stripe';
import config from '../../../../config';

import { ICreateStripeConnectAccount } from './payment.interface';
import { stripe } from './payment.utls';
import { IStripePaymentData } from './payment.validation';

import httpStatus from 'http-status';
import { ENUM_YN } from '../../../../global/enum_constant_type';
import { encryptCryptoData } from '../../../../utils/cryptoEncryptDecrypt';
import ApiError from '../../../errors/ApiError';
import { IUserRef } from '../../allUser/typesAndConst';

import { Product } from '../../productModule/products/model.products';

import { IOrder } from '../order/interface.order';
import { Order } from '../order/models.order';

const createPaymentStripeService = async (
  payload: IStripePaymentData,
  req: Request,
): Promise<Stripe.Response<Stripe.Checkout.Session>> => {
  const user = req.user as IUserRef;
  const { products } = payload;
  const product = products[0];

  // ****************file start*********************
  // eslint-disable-next-line prefer-const
  const result = await Product.findOne({
    _id: product.productId,
    isDelete: ENUM_YN.NO,
  });

  // eslint-disable-next-line prefer-const
  const findExisting = (await Order.findOne({
    'author.userId': user.userId,
    productId: product.productId,
    isDelete: ENUM_YN.NO,
  })) as IOrder;
  if (!result) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'File not found');
  }
  if (findExisting) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      'This file already exists no need purchase ',
    );
  }
  // ****************file end*********************

  //!---------------------------------------------------------------

  const amount = result.pricing.price;
  // console.log(orderDetails?.gigDetails?.images[0]?.url, 'orderDetails');
  const item = [
    {
      price_data: {
        currency: product?.currency || 'usd',
        product_data: {
          //@ts-ignore
          name: result?.title || `Fergie hair care ${result?.packageName}`,
          images: [
            result?.images
              ? result?.images[0]?.url
              : 'https://d43af62ilhxe5.cloudfront.net/upload/images/1733552328394-logo.jpg', //not support any cdn image
          ],
        },
        unit_amount: parseFloat((Number(amount) * 100).toFixed(2)),
      },
      quantity: 1,
    },
  ];

  const metadata: any = {
    products: JSON.stringify(product),
    userId: req?.user?.userId?.toString() || '',
    roleBaseUserId: req?.user?.roleBaseUserId?.toString() || '',
    role: req?.user?.role || '',
    currency: product?.currency || 'usd',
  };

  if (product.productId) {
    metadata.productId = product.productId.toString();
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: item,
    mode: 'payment',
    success_url: `${config.payment_url.stripe_success_url}?sessionId={CHECKOUT_SESSION_ID}&metadata=${JSON.stringify(metadata)}&metadataV2=${encryptCryptoData(metadata, config.crypto_key as string)}`, // Stripe will replace {CHECKOUT_SESSION_ID} with the actual session ID,
    cancel_url: config.payment_url.stripe_cancel_url,
    //metadata is very important because in this object in you are input any value
    metadata: metadata, //optional
    payment_intent_data: {
      metadata: metadata, // because when i ony set metadata session in , this metadata not found paymentIntent response in . because session metadata and payment intent metadata is deferent
      // setup_future_usage: 'off_session',
    },
    expires_at: Math.floor(Date.now() / 1000) + 1800 * 2, // Configured to expire after 2 hours
  });

  return session;
};

const createConnectAccount = async (
  payload: ICreateStripeConnectAccount,
  req: Request,
): Promise<Stripe.Response<Stripe.Account> | any> => {
  return null;
};

// update Category form db
const updateStripePaymentIntentService = async (
  id: string,
  payload: Partial<any>,
  req: Request,
): Promise<any | null> => {
  const result = null;
  return result;
};

export const StripeService = {
  createPaymentStripeService,
  updateStripePaymentIntentService,
  createConnectAccount,
};
