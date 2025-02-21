import { Request } from 'express';
import Stripe from 'stripe';
import config from '../../../../config';

import { ICreateStripeConnectAccount } from './payment.interface';
import { stripe } from './payment.utls';
import { IStripePaymentData } from './payment.validation';

import httpStatus from 'http-status';
import { encryptCryptoData } from '../../../../utils/cryptoEncryptDecrypt';
import ApiError from '../../../errors/ApiError';
import { IUserRef } from '../../allUser/typesAndConst';

import { Types } from 'mongoose';
import { Product } from '../../productModule/products/model.products';
export type IStripeMetaData = {
  products: string;
  userId: string;
  roleBaseUserId: string;
  role: string;
  currency: string;
};
export type IStripeProductMetaData = {
  productId: string;
  currency: string;
  name: string;
  quantity: number;
  price: number;
};
const createPaymentStripeService = async (
  payload: IStripePaymentData,
  req: Request,
): Promise<Stripe.Response<Stripe.Checkout.Session>> => {
  const user = req.user as IUserRef;
  const { products } = payload;

  // ****************file start*********************
  // eslint-disable-next-line prefer-const
  const result = await Product.find({
    _id: {
      $in: products.map(product => new Types.ObjectId(product.productId)),
    },
    isDelete: false,
  });

  if (result.length) {
    result.forEach(product => {
      if (product.isDelete === true) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          `Product ${product.name} is not available `,
        );
      }
      if (product.status !== 'active') {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          `Product ${product.name} is not active `,
        );
      }
    });
  }
  // ****************file end*********************

  const items: {
    price_data: {
      currency: string;
      product_data: {
        //@ts-ignore
        name: string;
        images: string[];
      };
      unit_amount: number;
    };
    quantity: number;
  }[] = [];
  const metaProducts: Array<IStripeProductMetaData> = [];
  result.forEach(item => {
    const amount = item.pricing.price;
    const findProduct = products.find(p => p.productId === item._id.toString());
    // console.log(orderDetails?.gigDetails?.images[0]?.url, 'orderDetails');

    items.push({
      price_data: {
        currency: item.pricing.currency || 'usd',
        product_data: {
          //@ts-ignore
          name: findProduct?.name || `${item?.name}`,
          images: [
            item?.images
              ? item?.images[0]?.url
              : 'https://d43af62ilhxe5.cloudfront.net/upload/images/1733552328394-logo.jpg', //not support any cdn image
          ],
        },
        unit_amount: parseFloat((Number(amount) * 100).toFixed(2)),
      },
      quantity: findProduct?.quantity || 1,
    });
    metaProducts.push({
      productId: item._id.toString(),
      currency: item.pricing.currency || 'usd',
      name: findProduct?.name || `${item?.name}`,
      quantity: findProduct?.quantity || 1,
      price: item.pricing.price,
    });
  });

  const metadata: IStripeMetaData = {
    products: JSON.stringify(metaProducts),
    userId: user?.userId?.toString() || '',
    roleBaseUserId: user?.roleBaseUserId?.toString() || '',
    role: user?.role || '',
    currency: products[0]?.currency || 'usd',
  };

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: items,
    mode: 'payment',
    success_url: `${config.payment_url.stripe_success_url}?sessionId={CHECKOUT_SESSION_ID}&metadataV2=${encryptCryptoData(metadata, config.crypto_key as string)}`, // Stripe will replace {CHECKOUT_SESSION_ID} with the actual session ID,
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
