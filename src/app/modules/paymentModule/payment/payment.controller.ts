/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../../../config';
import { ENUM_YN } from '../../../../global/enum_constant_type';
import { decryptCryptoData } from '../../../../utils/cryptoEncryptDecrypt';
import ApiError from '../../../errors/ApiError';
import catchAsync from '../../../share/catchAsync';
import sendResponse from '../../../share/sendResponse';
import { PaymentHistoryService } from '../paymentHistory/service.paymentHistory';
import { StripeService } from './payment.service';
import {
  stripe,
  stripeSessionIdCsId_To_PaymentIntent,
  stripeUpdatePaymentIntent,
} from './payment.utls';

const createPaymentStripe = catchAsync(async (req: Request, res: Response) => {
  const session = await StripeService.createPaymentStripeService(req.body, req);
  if (session?.id) {
    if (req.query?.requestDevice === 'web') {
      //! when user in web site then can user this and automatically redirect
      return res.redirect(301, session?.url as string);
    }
    // when app to request then user it
    else {
      sendResponse<any>(req, res, {
        success: true,
        statusCode: 200,
        message: 'successfully get secret',
        data: { id: session?.id, url: session.url },
      });
    }
  } else {
    throw new ApiError(404, 'Payment failed');
  }
});

const createPaymentStripeAdvanceForNative = catchAsync(
  async (req: Request, res: Response) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { paymentAmount: price, course_id } = req.body;
    const amount: number = parseFloat(price) * 100;
    // Use an existing Customer ID if this is a returning customer.
    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      // { apiVersion: '2022-11-15' },
      { apiVersion: '2023-10-16' },
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'USD',
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    if (paymentIntent.client_secret) {
      return res.status(200).send({
        success: true,
        statusCode: 200,
        message: 'successful get secret',
        data: {
          // paymentIntent: paymentIntent.client_secret,
          clientSecret: paymentIntent.client_secret,
          ephemeralKey: ephemeralKey.secret,
          customer: customer.id,
          publishableKey: process.env.STRIPE_PK,
        },
      });
    } else {
      throw new ApiError(404, 'Payment failed');
    }
  },
);
const test = catchAsync(async (req: Request, res: Response) => {
  const response = await stripeSessionIdCsId_To_PaymentIntent({
    cs_id: req.body?.cs_id,
  });

  sendResponse<any>(req, res, {
    success: true,
    statusCode: 200,
    message: 'successfully get secret',
    data: response,
  });
});

const successStripePayment = catchAsync(async (req: Request, res: Response) => {
  const { sessionId, metadata, metadataV2 } = req.query;
  if (!sessionId || !metadataV2) {
    throw new ApiError(404, 'Session not found');
  }
  const { result, sessionDetails } =
    await PaymentHistoryService.createPaymentHistoryByDb({
      cs_id: sessionId as string, //cs_test_a1OBKwDUIAWS6wCeNcxnyd77JRc5x7wqTRM05FYYv3JHde5IPa5TAbNzQd
      // metadata: metadata as string,
      metadata: decryptCryptoData(
        metadataV2 as string,
        config.crypto_key as string,
      ) as string,
    });

  if (!result) {
    throw new ApiError(404, 'Payment failed');
  }
  // Redirect to Google or send a response
  // res.writeHead(302, {
  //   location: config.client_side_url + '/dashboard/buyer/manage-orders',
  // });
  // res.end();
  sendResponse<any>(req, res, {
    success: true,
    statusCode: 200,
    message: 'successfully get secret',
    data: { result },
  });
  // res.render('stripeSuccessPayment.ejs', { data: { sessionId } });
  await stripeUpdatePaymentIntent({
    pi_id: result?.pi_id as string,
    metaData: {
      ...sessionDetails.paymentIntentResponse?.metadata,
      alreadyUsed: ENUM_YN.YES,
    },
  });
});
const cancelStripePayment = catchAsync(async (req: Request, res: Response) => {
  const { sessionId, metadata, metadataV2 } = req.query;
  res.render('somethingWrong.ejs');
});

const createStripeConnectAccount = catchAsync(
  async (req: Request, res: Response) => {
    // await RequestToFileDecodeAddBodyHandle(req);
    const account = await StripeService.createConnectAccount(req.body, req);
    sendResponse<any>(req, res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Account create successful',
      data: account,
    });
  },
);

// const transferAmount = catchAsync(async (req: Request, res: Response) => {
//   const {
//     bags,
//     shopId,
//     percentage = 10,
//   } = req.body as {
//     bags: [string];
//     shopId?: string;
//     percentage?: number;
//   };
//   const filteredBags = [...new Set(bags)];
//   const shop = await Shop.findById(shopId).populate('userId');
//   //@ts-ignore
//   if (!shop?.userId?.stripeAccount?.accountNo) {
//     throw new ApiError(404, ('Not found bank account details'));
//   }
//   const allBag = await Purchase.find({
//     bagId: { $in: filteredBags.map(bag => new Types.ObjectId(bag)) },
//     // 'employeePayment.isPayment': ENUM_YN.NO,
//   });
//   const totalAmount = allBag.reduce(
//     (accumulator, currentValue) => accumulator + currentValue.amount,
//     0,
//   );
//   const amount = totalAmount - (totalAmount / 100) * percentage;

//   let result;
//   const session = await mongoose.startSession();
//   try {
//     session.startTransaction();
//     const createPayment = await EmployeePayment.create(
//       [
//         {
//           percentage,
//           bags: filteredBags,
//           shopId,
//         },
//       ],
//       { session },
//     );
//     //@ts-ignore
//     if (!createPayment[0]?._id) {
//       throw new ApiError(400, 'Employee payment failed');
//     }
//     const updateAllPurchase = await Purchase.updateMany(
//       {
//         bagId: { $in: filteredBags.map(bag => new Types.ObjectId(bag)) },
//       },
//       {
//         $set: {
//           employeePayment: {
//             isPayment: ENUM_YN.YES,
//             //@ts-ignore
//             record: createPayment[0]._id,
//           },
//         },
//       },
//       { session },
//     );
// const transfer = await stripe.transfers.create({
//   amount: 10 * 100, // count cents -- $4 = 400 cents
//   currency: 'usd', //Mx er somoy mxn hobe
//   //@ts-ignore
//   destination: shop?.userId?.stripeAccount?.accountNo, //stripeConnectAccountID
//   //@ts-ignore
//   transfer_group: createPayment[0]._id.toString(),
// });
// transfer.amount = 10 / 100;

//     const updatePayment = await EmployeePayment.findOneAndUpdate(
//       {
//         _id: createPayment[0]._id,
//       },
//       transfer,

//       { new: true, session },
//     );
//     result = updatePayment;
//     await session.commitTransaction();
//     await session.endSession();
//   } catch (error: any) {
//     await session.abortTransaction();
//     await session.endSession();
//     throw new ApiError(httpStatus.BAD_REQUEST, error?.message);
//   }

//   sendResponse<any>(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: ('Employee payment successful'),
//     data: result,
//   });
// });

export const createPaymentController = {
  createPaymentStripe,
  createPaymentStripeAdvanceForNative,
  createStripeConnectAccount,
  // transferAmount,
  test,
  successStripePayment,
  cancelStripePayment,
};
