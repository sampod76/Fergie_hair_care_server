import Stripe from 'stripe';
import config from '../../../../config';
import { ENUM_YN } from '../../../../global/enum_constant_type';
import { INotification } from '../../notification/notification.interface';
import { NotificationService } from '../../notification/notification.service';
import { PaymentHistory } from '../paymentHistory/model.paymentHistory';

export const stripe = new Stripe(config.stripe.secret_key as string, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const stripeRefund = async (payload: {
  ch_id: string; //latest_charge: 'ch_3PPQzrAdJu4EQtRS0Ioak1tW',
}): Promise<Stripe.Response<Stripe.Refund>> => {
  const refund = await stripe.refunds.create({
    charge: payload.ch_id,
  });
  return refund;
};

export const stripeCheckBalanceTransaction = async (payload: {
  txn_id: string;
}): Promise<Stripe.Response<Stripe.BalanceTransaction>> => {
  const balanceTransaction = await stripe.balanceTransactions.retrieve(
    payload.txn_id,
  );
  return balanceTransaction;
};

export const stripeCheckPaymentIntentTransaction = async (payload: {
  pi_id: string; //pi_3PPQzrAdJu4EQtRS04CaPeUy
}): Promise<Stripe.Response<Stripe.PaymentIntent>> => {
  //console.log(payload.pi_id)
  const paymentIntents = await stripe.paymentIntents.retrieve(payload.pi_id);
  return paymentIntents;
  //check response --> https://www.notion.so/sampod/stripe-ad6ece2066f74d879f47cf736f295d71?pvs=4#d55a59d8e2aa44859c989875dba67f5b
  //paymentIntents.amount: 12000,
  //paymentIntents.status: 'succeeded',
};
export const stripeUpdatePaymentIntent = async (payload: {
  pi_id: string; //pi_3PPQzrAdJu4EQtRS04CaPeUy
  metaData: any; //pi_3PPQzrAdJu4EQtRS04CaPeUy
}): Promise<Stripe.Response<Stripe.PaymentIntent>> => {
  //console.log(payload.pi_id)
  const paymentIntents = await stripe.paymentIntents.update(payload.pi_id, {
    metadata: payload.metaData,
  });
  return paymentIntents;
  //check response --> https://www.notion.so/sampod/stripe-ad6ece2066f74d879f47cf736f295d71?pvs=4#d55a59d8e2aa44859c989875dba67f5b
  //paymentIntents.amount: 12000,
  //paymentIntents.status: 'succeeded',
};

export const stripeCheckSessionIdToTransaction = async (payload: {
  cs_id: string; //cs_test_a1fKshnHlXhmOAVqZ0J9le7Fx8fNVYEpHyeZP9byDfjTH3qcbkaKXKGVml
}): Promise<Stripe.Response<Stripe.Checkout.Session>> => {
  // console.log(payload.cs_id); //
  const sessionsResponse = await stripe.checkout.sessions.retrieve(
    payload.cs_id,
  );
  return sessionsResponse;
  //check response --> https://www.notion.so/sampod/stripe-ad6ece2066f74d879f47cf736f295d71?pvs=4#d55a59d8e2aa44859c989875dba67f5b
  // success --> sessionsResponse.payment_status: 'paid',
  //fail --> sessionsResponse.payment_status: 'unpaid',
};

export type IPaymentIntentAndSessionResponse = {
  paymentIntentResponse: Stripe.Response<Stripe.PaymentIntent> | null;
  sessionsResponse: Stripe.Response<Stripe.Checkout.Session> | null;
};

export const stripeSessionIdCsId_To_PaymentIntent = async (payload: {
  cs_id: string; //cs_test_a1fKshnHlXhmOAVqZ0J9le7Fx8fNVYEpHyeZP9byDfjTH3qcbkaKXKGVml
}): Promise<IPaymentIntentAndSessionResponse | null> => {
  //  console.log(payload.cs_id); //
  const sessionsResponse = await stripe.checkout.sessions.retrieve(
    payload.cs_id,
  );

  let paymentIntentResponse = null;
  if (sessionsResponse?.payment_intent) {
    paymentIntentResponse = await stripeCheckPaymentIntentTransaction({
      pi_id: sessionsResponse?.payment_intent as string, //pi_3PPQzrAdJu4EQtRS04CaPeUy
    });
  }

  return { sessionsResponse, paymentIntentResponse };
  //check response --> https://www.notion.so/sampod/stripe-ad6ece2066f74d879f47cf736f295d71?pvs=4#d55a59d8e2aa44859c989875dba67f5b
  // success --> sessionsResponse.status: 'succeeded',
  //latest_charge/ch_id -->latest_charge: 'ch_3PPPxwAdJu4EQtRS1mGMm2Zw',
};
export const stripeBalanceCheck = async (): Promise<number | null> => {
  const balance = await stripe.balance.retrieve();
  // Calculate the amount to payout
  const amountToPayout = balance.available[0].amount;
  return amountToPayout;
};

export const refundFunc = async ({
  usersAndMessage,
  orderId,
  ch_id,
}: {
  usersAndMessage?: { user: string; subject?: string; message: string }[];
  orderId: string;
  ch_id: string;
}) => {
  const refund = await stripeRefund({
    ch_id: ch_id,
  });

  if (orderId) {
    const ChangeRefund = await PaymentHistory.findOneAndUpdate(
      { orderId: orderId },
      {
        refund: {
          isRefund: ENUM_YN.YES,
          stripeRefundId: refund?.id,
          balance_transaction: refund?.balance_transaction as string,
          ch_id: refund?.charge as string,
        },
      },
      { new: true, runValidators: true },
    );
  }

  if (refund?.status === 'succeeded') {
    if (usersAndMessage && usersAndMessage[0].user) {
      const data: INotification = {
        userIds: [usersAndMessage[0].user],
        subject: 'Refund',
        bodyText:
          usersAndMessage[0].message ||
          `${'Refund your transaction'}) : ${refund.id} .${'Amount'}: ${refund.amount}`,
      };
      await NotificationService.createNotificationToDB(data);
    }
  }
  return refund;
};
